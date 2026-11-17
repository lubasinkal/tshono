import { Pool, types } from 'pg'

// pg parses DATE into a JS Date by default, which turns '2027-03-31' into a full
// ISO timestamp on the wire and in Typesense. Keep calendar dates as strings.
types.setTypeParser(1082, (v: string) => v)

// One pool per process. DATABASE_URL comes from .env locally and from the
// Dokploy environment in production. Neon's pooler multiplexes these, so 20 per
// instance is plenty; more just queues inside the database.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
})
