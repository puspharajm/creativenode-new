const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_h0wFzxRbc9DV@ep-noisy-haze-aowfgd4h-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});

async function seedCrm() {
  const client = await pool.connect();
  try {
    console.log("Connected to Neon DB. Seeding CRM data...");

    // Create CRM tables if they don't exist
    await client.query(`
      DROP TABLE IF EXISTS client_websites CASCADE;
      DROP TABLE IF EXISTS client_posters CASCADE;
      DROP TABLE IF EXISTS clients CASCADE;

      CREATE TABLE clients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        industry TEXT NOT NULL,
        brand_color TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS client_posters (
        id TEXT PRIMARY KEY,
        client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        design_style TEXT NOT NULL,
        status TEXT NOT NULL,
        bg_url TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS client_websites (
        id TEXT PRIMARY KEY,
        client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        thumbnail TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Sample CRM Data
    const clients = [
      { id: "client-jp", name: "JP Fitness Studios", industry: "Health & Wellness", brand_color: "#eec12e", sort_order: 1 },
      { id: "client-hotel", name: "Hotel Tamil Park", industry: "Hospitality", brand_color: "#ca8a0f", sort_order: 2 },
      { id: "client-ksp", name: "KSP Pattu Maaligai", industry: "Retail", brand_color: "#a16412", sort_order: 3 },
    ];

    for (const c of clients) {
      await client.query(
        `INSERT INTO clients (id, name, industry, brand_color, sort_order) VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET name = $2, industry = $3, brand_color = $4, sort_order = $5`,
        [c.id, c.name, c.industry, c.brand_color, c.sort_order]
      );
    }

    const posters = [
      { id: "poster-jp-1", client_id: "client-jp", title: "Summer Shred Campaign", design_style: "Brutalist / High Contrast", status: "Approved", bg_url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80", sort_order: 1 },
      { id: "poster-hotel-1", client_id: "client-hotel", title: "Luxury Weekend Getaway", design_style: "Modernist / Clean", status: "In Review", bg_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80", sort_order: 2 },
      { id: "poster-ksp-1", client_id: "client-ksp", title: "Festive Silk Collection", design_style: "Elegant / Minimal", status: "Draft", bg_url: "https://images.unsplash.com/photo-1583391733958-d2597461511f?auto=format&fit=crop&w=800&q=80", sort_order: 3 }
    ];

    for (const p of posters) {
      await client.query(
        `INSERT INTO client_posters (id, client_id, title, design_style, status, bg_url, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET title = $3, design_style = $4, status = $5, bg_url = $6, sort_order = $7`,
        [p.id, p.client_id, p.title, p.design_style, p.status, p.bg_url, p.sort_order]
      );
    }

    const websites = [
      { id: "site-jp-1", client_id: "client-jp", url: "jpfitness.com", type: "Landing Page", status: "Live", thumbnail: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80", sort_order: 1 },
      { id: "site-hotel-1", client_id: "client-hotel", url: "hoteltamilpark.com", type: "E-Commerce / Booking", status: "Development", thumbnail: "https://images.unsplash.com/photo-1551882547-ff40c0d13c23?auto=format&fit=crop&w=800&q=80", sort_order: 2 }
    ];

    for (const w of websites) {
      await client.query(
        `INSERT INTO client_websites (id, client_id, url, type, status, thumbnail, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET url = $3, type = $4, status = $5, thumbnail = $6, sort_order = $7`,
        [w.id, w.client_id, w.url, w.type, w.status, w.thumbnail, w.sort_order]
      );
    }

    console.log("CRM data seeded successfully.");
  } catch (err) {
    console.error("Error seeding CRM data:", err);
  } finally {
    client.release();
    pool.end();
  }
}

seedCrm();
