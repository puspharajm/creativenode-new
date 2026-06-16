import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { Pool } from "pg";
import multer from "multer";
import fs from "fs";

const PORT = 3000;

// Neon PostgreSQL Database Connection
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_h0wFzxRbc9DV@ep-noisy-haze-aowfgd4h-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer config for local image storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}_${safeName}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB max

// Initialize Neon tables on startup
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
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
  app.use("/uploads", express.static(UPLOADS_DIR));

  // ─── IMAGE UPLOAD ENDPOINT ───────────────────────────────────────────────
  app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ status: "error", message: "No file provided." });
    }
    const url = `/uploads/${req.file.filename}`;
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
