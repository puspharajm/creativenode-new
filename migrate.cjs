## Advanced CRM Panel Implementation Plan

### Database Schema Update
Need migration to add key CRM fields:
```sql
-- Add assignment tracking
ALTER TABLE postings
  ADD COLUMN assigned_to TEXT,
  MODIFY COLUMN title TEXT NOT NULL;

-- Add status tracking for posters
ALTER TABLE client_posters
  ADD COLUMN status TEXT DEFAULT 'draft';

-- Add admin toggle for client management
ALTER TABLE clients
  ADD COLUMN is_admin BOOLEAN DEFAULT false;
```

### Migration Execution
Create migration runner script (migrate.js):
```javascript
const { Client } = require('pg');

async function migrate() {
  const client = new Client({
    connectionString: process.env.NEON_URL
  });

  try {
    await client.connect();
    await client.query(`
      ALTER TABLE postings
        ADD COLUMN assigned_to TEXT,
        MODIFY COLUMN title TEXT NOT NULL;

      ALTER TABLE client_posters
        ADD COLUMN status TEXT DEFAULT 'draft';

      ALTER TABLE clients
        ADD COLUMN is_admin BOOLEAN DEFAULT false;
    `);
    console.log('CRM schema upgrades applied successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

migrate();