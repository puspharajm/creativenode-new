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

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer config for AWS S3 storage
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const upload = multer({
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
      VALUES ('local-admin-sovereign', 'puspharaj.m2003@gmail.com', 'Push@2003', 'Puspharaj M', true)
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
    `);
    console.log("[Neon DB] Tables initialized successfully.");
  } catch (err) {
    console.error("[Neon DB] Table init failed:", err);
  } finally {
    client.release();
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  // Serve uploaded images as static files
  // app.use("/uploads", express.static(UPLOADS_DIR)); // Disabled after migrating to S3

  // ─── IMAGE UPLOAD ENDPOINT ───────────────────────────────────────────────
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ status: "error", message: "No file provided." });
    }
    // S3 URL is provided by multer-s3 in the file.location property
    const url = (req.file as any).location;
    // Record upload metadata in the uploaded_files table
    try {
      const client = await pool.connect();
      await client.query(
        `INSERT INTO uploaded_files (id, s3_key, original_name, content_type, size, uploaded_by) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          `file-${Date.now()}`,
          (req.file as any).key,
          req.file.originalname,
          req.file.mimetype,
          req.file.size,
          // Assuming a simple auth context – replace with actual user ID if available
          (req as any).user?.uid || null,
        ]
      );
      client.release();
    } catch (e) {
      console.error('Failed to record uploaded file:', e);
    }
    res.json({ status: "success", url });
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

  // ─── SERVE VITE OR STATIC ─────────────────────────────────────────────────
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

initDB().then(() => startServer()).catch((error) => {
  console.error("Server startup crashed:", error);
});
