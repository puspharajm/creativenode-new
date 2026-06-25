// PostgreSQL connection pool for Neon
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// The connection string is stored in the .env file as NEON_URL
export const pool = new Pool({
  connectionString: process.env.NEON_URL,
});

// Export a helper for simple queries – useful for quick replacements of Firestore calls
export const query = (text: string, params?: any[]) => pool.query(text, params);
