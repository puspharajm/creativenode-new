import { Pool } from 'pg';

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_h0wFzxRbc9DV@ep-noisy-haze-aowfgd4h-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});

async function pushData() {
  const client = await pool.connect();
  try {
    console.log("Connected to Neon DB. Pushing sample custom poster data...");

    // Create table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS custom_posters (
        id TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Sample data
    const samplePosters = [
      {
        id: "poster-cyber-1",
        data: {
          id: "poster-cyber-1",
          title: "Cyberpunk Night",
          description: "Neon lit futuristic city vibes.",
          bgValue: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&w=800&q=80",
          themeId: "modernist",
          status: "Live",
          archived: false,
          createdAt: new Date().toISOString()
        }
      },
      {
        id: "poster-swiss-1",
        data: {
          id: "poster-swiss-1",
          title: "Swiss Alpine Minimal",
          description: "Clean typography with stark contrasts.",
          bgValue: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
          themeId: "brutalist",
          status: "Pending",
          archived: false,
          createdAt: new Date().toISOString()
        }
      }
    ];

    for (const poster of samplePosters) {
      await client.query(
        `INSERT INTO custom_posters (id, data, updated_at) VALUES ($1, $2, NOW())
         ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = NOW()`,
        [poster.id, JSON.stringify(poster.data)]
      );
      console.log(`Inserted/Updated: ${poster.id}`);
    }

    console.log("Data pushed successfully.");
  } catch (err) {
    console.error("Error pushing data:", err);
  } finally {
    client.release();
    pool.end();
  }
}

pushData();
