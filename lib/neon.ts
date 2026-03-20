import { neon } from "@neondatabase/serverless";

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Add it to your environment variables.",
    );
  }

  return databaseUrl;
}

let sqlClient: ReturnType<typeof neon> | null = null;

function getSqlClient() {
  if (!sqlClient) {
    sqlClient = neon(getDatabaseUrl());
  }

  return sqlClient;
}

export const sql = ((...args: Parameters<ReturnType<typeof neon>>) =>
  getSqlClient()(...args)) as ReturnType<typeof neon>;

let initPromise: Promise<void> | null = null;

async function createTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS app_users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS app_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
      token_hash TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS app_progress (
      user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
      level_id TEXT NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      xp_earned INTEGER NOT NULL DEFAULT 0,
      attempt_count INTEGER NOT NULL DEFAULT 0,
      hints INTEGER NOT NULL DEFAULT 0,
      last_schema TEXT,
      last_query TEXT,
      completed_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, level_id)
    )
  `;
}

export async function ensureAppSchema() {
  if (!initPromise) {
    initPromise = createTables();
  }
  await initPromise;
}
