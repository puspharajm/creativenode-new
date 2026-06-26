import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { Pool } from "pg";
import multer from "multer";
import AWS from "aws-sdk";
import multerS3 from "multer-s3";
import fs from "fs";
import { OAuth2Client } from "google-auth-library";

const PORT = 3000;
const googleClient = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);

// Neon PostgreSQL Database Connection
const pool = new Pool({
  connectionString: process.env.NEON_URL,
});

// Uploads are handled entirely via AWS S3 in production

// Multer config for AWS S3 storage (fallback to Neon Database memory storage if no credentials)
let upload: multer.Multer;
const hasAwsCreds = 
  process.env.AWS_ACCESS_KEY_ID && 
  process.env.AWS_ACCESS_KEY_ID !== 'your-key' &&
  !process.env.AWS_ACCESS_KEY_ID.includes('your-') &&
  process.env.AWS_SECRET_ACCESS_KEY && 
  process.env.AWS_SECRET_ACCESS_KEY !== 'your-secret' &&
  !process.env.AWS_SECRET_ACCESS_KEY.includes('your-');

if (hasAwsCreds) {
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });

  upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.S3_ACCESS_POINT_ALIAS || process.env.S3_BUCKET_NAME || 'creativenode-uploads',
      metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: (req, file, cb) => {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        const uniqueName = `${Date.now()}_${safeName}`;
        cb(null, uniqueName);
      },
      contentType: multerS3.autoContentType,
      acl: 'public-read'
    }),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
  });
} else {
  // If S3 keys are not provided or are dummy values, upload directly to memory and store in Neon DB
  upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
  });
}

// Initialize Neon tables on startup
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS uploaded_files (
        id TEXT PRIMARY KEY,
        s3_key TEXT NOT NULL,
        original_name TEXT NOT NULL,
        content_type TEXT,
        size BIGINT,
        uploaded_by TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS users (
        uid TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        display_name TEXT,
        photo_url TEXT,
        is_admin BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Insert the default super-admin if they don't exist
      INSERT INTO users (uid, email, password, display_name, is_admin)
      VALUES ('local-admin-sovereign', 'puspharaj.m2003@gmail.com', 'Push@2003', 'Mudalvar', true)
      ON CONFLICT (email) DO NOTHING;
      
      CREATE TABLE IF NOT EXISTS creativenode_leads (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        service TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS custom_posters (
        id TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS system_audit_logs (
        id TEXT PRIMARY KEY,
        timestamp BIGINT NOT NULL,
        action TEXT NOT NULL,
        details TEXT NOT NULL,
        admin_email TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS clients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        tagline TEXT,
        accent TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS client_posters (
        id TEXT PRIMARY KEY,
        client_id TEXT NOT NULL,
        title TEXT NOT NULL,
        image_path TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS client_websites (
        id TEXT PRIMARY KEY,
        client_id TEXT NOT NULL,
        title TEXT NOT NULL,
        image_path TEXT NOT NULL,
        approved BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("[Neon DB] Tables initialized successfully.");
    
    // Add file_data column to support Neon DB binary uploads when S3 is not available
    await client.query(`
      ALTER TABLE uploaded_files ADD COLUMN IF NOT EXISTS file_data BYTEA;
    `);
  } catch (err) {
    console.error("[Neon DB] Table init failed:", err);
  } finally {
    client.release();
  }
}

const app = express();

let isDbInitialized = false;
app.use(async (req, res, next) => {
  if (!isDbInitialized && !req.path.startsWith('/assets')) {
    try {
      await initDB();
      isDbInitialized = true;
    } catch (e) {
      console.error("DB init failed:", e);
    }
  }
  next();
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));

  // Serve uploaded images directly from Neon DB (or fallback to static uploads folder)
  app.get("/uploads/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT file_data, content_type FROM uploaded_files WHERE id = $1 OR s3_key = $1', [id]);
      client.release();

      if (result.rows.length === 0 || !result.rows[0].file_data) {
        // Fallback: check if local file exists on disk
        const filePath = path.join(process.cwd(), "uploads", id);
        if (fs.existsSync(filePath)) {
          return res.sendFile(filePath);
        }
        return res.status(404).send("File not found");
      }

      const file = result.rows[0];
      res.setHeader("Content-Type", file.content_type || "image/jpeg");
      res.send(file.file_data);
    } catch (err) {
      console.error("Failed to serve file from DB:", err);
      res.status(500).send("Error retrieving file");
    }
  });

  // Serve static uploads if they exist locally on disk as legacy fallback
  app.use("/uploads-local", express.static(path.join(process.cwd(), "uploads")));

  // ─── IMAGE UPLOAD ENDPOINT ───────────────────────────────────────────────
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ status: "error", message: "No file provided." });
    }
    
    const fileId = `file-${Date.now()}`;
    const isS3 = (req.file as any).location !== undefined;
    const url = isS3 ? (req.file as any).location : `/uploads/${fileId}`;
    const key = isS3 ? (req.file as any).key : fileId;

    // Record upload metadata (and binary data if S3 is inactive) in Neon PostgreSQL
    try {
      const client = await pool.connect();
      await client.query(
        `INSERT INTO uploaded_files (id, s3_key, original_name, content_type, size, uploaded_by, file_data) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          fileId,
          key,
          req.file.originalname,
          req.file.mimetype,
          req.file.size,
          // Assuming a simple auth context – replace with actual user ID if available
          (req as any).user?.uid || null,
          isS3 ? null : req.file.buffer // Store buffer directly in Neon if not S3
        ]
      );
      client.release();
      res.json({ status: "success", url });
    } catch (err) {
      console.error("DB insert error for upload:", err);
      res.status(500).json({ status: "error", message: "Failed to save file metadata to Database." });
    }
  });

  // ─── DATABASE STATUS ─────────────────────────────────────────────────────
  app.get("/api/db/status", async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT NOW() as current_time, version() as version;');
      client.release();
      res.json({ status: "success", message: "Connected to Neon Database!", data: result.rows[0] });
    } catch (err) {
      res.status(500).json({ status: "error", message: "Database connection failed", error: (err as any).message });
    }
  });

  // ─── AUTHENTICATION ENDPOINTS ────────────────────────────────────────────
  app.post("/api/auth/signup", async (req, res) => {
    const { email, password, displayName } = req.body;
    if (!email || !password) return res.status(400).json({ status: "error", message: "Email and password required." });
    try {
      const client = await pool.connect();
      const uid = `user-${Date.now()}`;
      await client.query(
        'INSERT INTO users (uid, email, password, display_name) VALUES ($1, $2, $3, $4)',
        [uid, email, password, displayName]
      );
      client.release();
      res.json({ status: "success", user: { uid, email, displayName, photoURL: null } });
    } catch (err: any) {
      if (err.code === '23505') {
        res.status(400).json({ status: "error", message: "Email already in use." });
      } else {
        res.status(500).json({ status: "error", message: "Signup failed." });
      }
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ status: "error", message: "Email and password required." });
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
      client.release();
      if (result.rows.length === 0) {
        return res.status(401).json({ status: "error", message: "Invalid credentials." });
      }
      const user = result.rows[0];
      res.json({ status: "success", user: { uid: user.uid, email: user.email, displayName: user.display_name, photoURL: user.photo_url } });
      } catch (err) {
        res.status(500).json({ status: "error", message: "Login failed." });
      }
    });

    app.post("/api/auth/google", async (req, res) => {
      const { credential } = req.body;
      if (!credential) return res.status(400).json({ status: "error", message: "Missing credential." });
      
      try {
        let email, name, picture, uid;
        
        if (credential.split('.').length === 3) {
          const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.VITE_GOOGLE_CLIENT_ID,
          });
          const payload = ticket.getPayload();
          if (!payload || !payload.email) return res.status(400).json({ status: "error", message: "Invalid Google token payload." });
          
          email = payload.email;
          name = payload.name || payload.given_name || "Google User";
          picture = payload.picture || "";
          uid = `google-${payload.sub}`;
        } else {
          const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${credential}` }
          });
          if (!response.ok) throw new Error("Failed to fetch user profile with access token");
          const payload = await response.json();
          if (!payload || !payload.email) return res.status(400).json({ status: "error", message: "Invalid Google token payload." });
          
          email = payload.email;
          name = payload.name || payload.given_name || "Google User";
          picture = payload.picture || "";
          uid = `google-${payload.sub}`;
        }
        
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (result.rows.length === 0) {
          // Create new user (using a random placeholder password since they use SSO)
          const randomPassword = "sso_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
          await client.query(
            'INSERT INTO users (uid, email, password, display_name, photo_url) VALUES ($1, $2, $3, $4, $5)',
            [uid, email, randomPassword, name, picture]
          );
          client.release();
          return res.json({ status: "success", user: { uid, email, displayName: name, photoURL: picture } });
        } else {
          // User exists, login
          const user = result.rows[0];
          client.release();
          return res.json({ status: "success", user: { uid: user.uid, email: user.email, displayName: user.display_name, photoURL: user.photo_url } });
        }
        } catch (err: any) {
          console.error("Google verify error:", err);
          return res.status(500).json({ status: "error", message: `Google Auth Error: ${err.message}` });
        }
    });

  // ─── CRM LEADS (Replaces Firestore logic) ────────────────────────────────
  app.get("/api/db/leads", async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM creativenode_leads ORDER BY created_at DESC');
      client.release();
      res.json({ status: "success", data: result.rows });
    } catch (err) {
      res.status(500).json({ status: "error", message: "Failed to fetch leads" });
    }
  });

  app.post("/api/db/leads", async (req, res) => {
    const { name, email, service } = req.body;
    const id = `lead-${Date.now()}`;
    try {
      const client = await pool.connect();
      await client.query(
        'INSERT INTO creativenode_leads (id, name, email, service) VALUES ($1, $2, $3, $4)',
        [id, name, email, service]
      );
      client.release();
      res.json({ status: "success", id });
    } catch (err) {
      res.status(500).json({ status: "error", message: "Failed to create lead" });
    }
  });

  // ─── CUSTOM POSTERS (replaces Firestore custom_posters) ──────────────────
  app.get("/api/db/custom-posters", async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT id, data FROM custom_posters ORDER BY created_at DESC');
      client.release();
      const posters = result.rows.map(row => ({ id: row.id, ...row.data }));
      res.json({ status: "success", data: posters });
    } catch (err) {
      res.status(500).json({ status: "error", message: "Failed to fetch posters", error: (err as any).message });
    }
  });

  app.post("/api/db/custom-posters", async (req, res) => {
    const { id, ...data } = req.body;
    if (!id) return res.status(400).json({ status: "error", message: "id is required" });
    try {
      const client = await pool.connect();
      await client.query(
        `INSERT INTO custom_posters (id, data, updated_at) VALUES ($1, $2, NOW())
         ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = NOW()`,
        [id, JSON.stringify(data)]
      );
      client.release();
      res.json({ status: "success", message: "Poster saved." });
    } catch (err) {
      res.status(500).json({ status: "error", message: "Failed to save poster", error: (err as any).message });
    }
  });

  app.delete("/api/db/custom-posters/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const client = await pool.connect();
      await client.query('DELETE FROM custom_posters WHERE id = $1', [id]);
      client.release();
      res.json({ status: "success", message: "Poster deleted." });
    } catch (err) {
      res.status(500).json({ status: "error", message: "Failed to delete poster", error: (err as any).message });
    }
  });

  // ─── AUDIT LOGS (replaces Firestore system_audit_logs) ───────────────────
  app.get("/api/db/audit-logs", async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM system_audit_logs ORDER BY timestamp DESC LIMIT 200');
      client.release();
      const logs = result.rows.map(r => ({
        id: r.id,
        timestamp: Number(r.timestamp),
        action: r.action,
        details: r.details,
        adminEmail: r.admin_email
      }));
      res.json({ status: "success", data: logs });
    } catch (err) {
      res.status(500).json({ status: "error", message: "Failed to fetch audit logs", error: (err as any).message });
    }
  });

  app.post("/api/db/audit-logs", async (req, res) => {
    const { id, timestamp, action, details, adminEmail } = req.body;
    if (!id || !action || !details) {
      return res.status(400).json({ status: "error", message: "id, action, details required" });
    }
    try {
      const client = await pool.connect();
      await client.query(
        `INSERT INTO system_audit_logs (id, timestamp, action, details, admin_email) VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING`,
        [id, timestamp || Date.now(), action, details, adminEmail || 'admin@creativenode.in']
      );
      client.release();
      res.json({ status: "success", message: "Log saved." });
    } catch (err) {
      res.status(500).json({ status: "error", message: "Failed to save log", error: (err as any).message });
    }
  });

  // ─── CRM DATA (real Neon tables) ─────────────────────────────────────────
  app.get("/api/db/crm-data", async (req, res) => {
    try {
      const client = await pool.connect();
      const clientsRes = await client.query('SELECT * FROM clients ORDER BY sort_order ASC, created_at DESC');
      const postersRes = await client.query('SELECT * FROM client_posters ORDER BY sort_order ASC, created_at DESC');
      const websitesRes = await client.query('SELECT * FROM client_websites ORDER BY sort_order ASC, created_at DESC');
      client.release();
      res.json({
        status: "success",
        data: { clients: clientsRes.rows, posterDesigns: postersRes.rows, websites: websitesRes.rows }
      });
    } catch (err) {
      res.status(500).json({ status: "error", message: "Failed to fetch CRM data", error: (err as any).message });
    }
  });

  app.post("/api/db/clients", async (req, res) => {
    const { id, name, slug, tagline, accent, sort_order } = req.body;
    try {
      const client = await pool.connect();
      await client.query(
        `INSERT INTO clients (id, name, slug, tagline, accent, sort_order) VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET name = $2, slug = $3, tagline = $4, accent = $5, sort_order = $6`,
        [id, name, slug, tagline, accent, sort_order || 0]
      );
      client.release();
      res.json({ status: "success", message: "Client saved." });
    } catch (err) {
      res.status(500).json({ status: "error", message: "Failed to save client", error: (err as any).message });
    }
  });

  app.delete("/api/db/clients/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const client = await pool.connect();
      await client.query('DELETE FROM clients WHERE id = $1', [id]);
      await client.query('DELETE FROM client_posters WHERE client_id = $1', [id]);
      await client.query('DELETE FROM client_websites WHERE client_id = $1', [id]);
      client.release();
      res.json({ status: "success", message: "Client deleted." });
    } catch (err) {
      res.status(500).json({ status: "error", message: "Failed to delete client", error: (err as any).message });
    }
  });

  app.post("/api/db/client-posters", async (req, res) => {
    const { id, client_id, title, image_path, sort_order } = req.body;
    try {
      const client = await pool.connect();
      await client.query(
        `INSERT INTO client_posters (id, client_id, title, image_path, sort_order) VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET title = $3, image_path = $4, sort_order = $5`,
        [id, client_id, title, image_path, sort_order || 0]
      );
      client.release();
      res.json({ status: "success", message: "Poster saved." });
    } catch (err) {
      res.status(500).json({ status: "error", message: "Failed to save poster", error: (err as any).message });
    }
  });

  app.delete("/api/db/client-posters/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const client = await pool.connect();
      await client.query('DELETE FROM client_posters WHERE id = $1', [id]);
      client.release();
      res.json({ status: "success", message: "Poster deleted." });
    } catch (err) {
      res.status(500).json({ status: "error", message: "Failed to delete poster", error: (err as any).message });
    }
  });

  app.post("/api/db/client-websites", async (req, res) => {
    const { id, client_id, title, image_path, approved, sort_order } = req.body;
    try {
      const client = await pool.connect();
      await client.query(
        `INSERT INTO client_websites (id, client_id, title, image_path, approved, sort_order) VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET title = $3, image_path = $4, approved = $5, sort_order = $6`,
        [id, client_id, title, image_path, approved ?? true, sort_order || 0]
      );
      client.release();
      res.json({ status: "success", message: "Website saved." });
    } catch (err) {
      res.status(500).json({ status: "error", message: "Failed to save website", error: (err as any).message });
    }
  });

  app.delete("/api/db/client-websites/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const client = await pool.connect();
      await client.query('DELETE FROM client_websites WHERE id = $1', [id]);
      client.release();
      res.json({ status: "success", message: "Website deleted." });
    } catch (err) {
      res.status(500).json({ status: "error", message: "Failed to delete website", error: (err as any).message });
    }
  });

  // ─── INSPIRATION FALLBACK DATA ────────────────────────────────────────────
  const FALLBACK_INSPIRATION = [
    { headline: "CHROME REACTIONISM", trend: "Saturated liquid metallic elements positioned off-center against heavy high-contrast black grids.", visualReference: "High-grain dark concrete surfaces overlaid with metallic warp lines.", dominantColor: "#00F0FF", fontSuggestion: "JetBrains Mono" },
    { headline: "SWISS MINIMAL DEGRADE", trend: "Dual-color ultra-saturated orange-to-pink gradient backdrops masked by tight vertical black layouts.", visualReference: "Grainy luxury posters combining elegant serif headlines with strict mono captions.", dominantColor: "#FF5A36", fontSuggestion: "Playfair Display" },
    { headline: "NEO-SKEUOMORPHIC AVANT", trend: "Faded vintage scanning scanlines with extreme physical paper-grain finishes and high contrast gold vector structures.", visualReference: "Matte-look physical editorial print templates emphasizing micro details.", dominantColor: "#D4AF37", fontSuggestion: "Space Grotesk" }
  ];

  // ─── GEMINI AI INSPIRATION ────────────────────────────────────────────────
  app.get("/api/gemini/inspiration", async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.json({ trends: FALLBACK_INSPIRATION, source: "mocked" });

    try {
      const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Generate exactly 3 extremely creative and inspiring daily trending modernist, brutalist, and Swiss poster design patterns.`,
        config: {
          systemInstruction: "You are an elite editorial poster design consultant. Provide ultra-crisp creative briefs.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                headline: { type: Type.STRING },
                trend: { type: Type.STRING },
                visualReference: { type: Type.STRING },
                dominantColor: { type: Type.STRING },
                fontSuggestion: { type: Type.STRING }
              },
              required: ["headline", "trend", "visualReference", "dominantColor", "fontSuggestion"]
            }
          }
        }
      });
      if (response.text) return res.json({ trends: JSON.parse(response.text.trim()), source: "gemini" });
      throw new Error("Empty response");
    } catch (err) {
      return res.json({ trends: FALLBACK_INSPIRATION, error: (err as any).message, source: "fallback" });
    }
  });

  // ─── AI POSTER CONTENT GENERATION ──────────────────────────────────────────
  app.post("/api/generate-poster-content", async (req, res) => {
    const { brandName } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!brandName) {
      return res.status(400).json({ error: "Brand name is required" });
    }

    if (!apiKey) {
      // Fallback if no API key is provided
      return res.json({
        title: `${brandName} Collection`,
        subtitle: "Premium Standard Edition",
        details: `Exclusive new specifications for ${brandName}. Featuring modern design principles and structural aesthetics.`,
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });
      const prompt = `Generate highly engaging, premium advertising poster copy for a brand named "${brandName}". Provide a short catchy Title, a Subtitle, and a 1-2 sentence Details description.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an elite editorial poster design copywriter. Keep it premium, concise, and impactful.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              subtitle: { type: Type.STRING },
              details: { type: Type.STRING }
            },
            required: ["title", "subtitle", "details"]
          }
        }
      });
      if (response.text) {
        return res.json(JSON.parse(response.text.trim()));
      }
      throw new Error("Empty response");
    } catch (err) {
      console.error("AI Generation Error:", err);
      // Fallback on error
      return res.json({
        title: `${brandName} Exclusive`,
        subtitle: "The New Standard",
        details: `Experience the latest design evolution from ${brandName}. Modernism redefined.`,
      });
    }
  });

  // ─── AI IMAGE ANALYSIS FOR POSTER GENERATION ─────────────────────────────
  app.post("/api/analyze-image", async (req, res) => {
    const { imageUrl } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!imageUrl) {
        return res.status(400).json({ error: "Image URL is required" });
    }

    try {
       let fileDataBuffer: Buffer;
       let mimeType = "image/jpeg";
       
       if (imageUrl.startsWith("http")) {
           // Fetch from S3/external
           const imgRes = await fetch(imageUrl);
           const arrayBuffer = await imgRes.arrayBuffer();
           fileDataBuffer = Buffer.from(arrayBuffer);
           mimeType = imgRes.headers.get("content-type") || "image/jpeg";
       } else {
           const fileId = imageUrl.replace("/uploads/", "");
           const client = await pool.connect();
           const result = await client.query('SELECT file_data, content_type FROM uploaded_files WHERE id = $1', [fileId]);
           client.release();
           
           if (result.rows.length === 0 || !result.rows[0].file_data) {
               // check local disk
               const filePath = path.join(process.cwd(), "uploads", fileId);
               if (fs.existsSync(filePath)) {
                   fileDataBuffer = fs.readFileSync(filePath);
                   mimeType = "image/jpeg";
               } else {
                   return res.status(404).json({ error: "Image not found in database or disk" });
               }
           } else {
               fileDataBuffer = result.rows[0].file_data;
               mimeType = result.rows[0].content_type || "image/jpeg";
           }
       }
       
       if (!apiKey) {
           return res.json({
               brandName: "AutoBrand",
               title: "Auto Generated Poster",
               subtitle: "AI Vision Fallback",
               details: "This is a placeholder because Gemini API key is missing.",
               keywords: "Auto, Generated, Design",
               accentColor: "#d4af37"
           });
       }
       
       const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });
       
       const prompt = `Analyze this image. If there are any logos, text, or clear branding, infer the Brand Name. If not, generate a highly creative and suitable Brand Name based on the image's vibe.
Provide the following in JSON format:
- brandName: The inferred or generated brand name.
- title: A short, catchy, premium advertising title for a poster featuring this image.
- subtitle: A compelling subtitle.
- details: A 1-2 sentence descriptive narrative for the poster.
- keywords: 3-5 comma-separated keywords describing the mood/style.
- accentColor: A recommended hex color code (e.g. #d4af37) that complements the image beautifully.`;

       const response = await ai.models.generateContent({
         model: "gemini-2.5-flash",
         contents: [
             prompt,
             {
                 inlineData: {
                     data: fileDataBuffer.toString("base64"),
                     mimeType: mimeType
                 }
             }
         ],
         config: {
           responseMimeType: "application/json",
           responseSchema: {
             type: Type.OBJECT,
             properties: {
               brandName: { type: Type.STRING },
               title: { type: Type.STRING },
               subtitle: { type: Type.STRING },
               details: { type: Type.STRING },
               keywords: { type: Type.STRING },
               accentColor: { type: Type.STRING }
             },
             required: ["brandName", "title", "subtitle", "details", "keywords", "accentColor"]
           }
         }
       });
       
       if (response.text) {
         return res.json(JSON.parse(response.text.trim()));
       }
       throw new Error("Empty response");
    } catch (err) {
       console.error("Image Analysis Error:", err);
       return res.status(500).json({ error: "Failed to analyze image" });
    }
  });


  // ─── SERVE VITE OR STATIC ─────────────────────────────────────────────────
  // Export the app for Vercel Serverless Functions
  export default app;

  async function startLocalServer() {
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[Express Server] active on http://0.0.0.0:${PORT}`);
    });
  }

  // Only start the local server if not running in a serverless environment (Vercel)
  if (!process.env.VERCEL) {
    startLocalServer().catch((error) => {
      console.error("Server startup crashed:", error);
    });
  }
