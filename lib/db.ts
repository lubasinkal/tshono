import { Pool } from 'pg'

// One pool per process. DATABASE_URL comes from .env locally and from the
// Dokploy environment in production.
export const pool = new Pool({ connectionString: process.env.DATABASE_URL })
