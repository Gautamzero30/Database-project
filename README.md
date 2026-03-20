# SQL Escape Dungeon

A SQL learning app where each user signs up, completes schema design tasks, inserts data, and then solves query tasks.

## What Is Implemented

- Account signup/login with secure session cookies
- Progress persistence per user in Neon Postgres
- Three fixed task tracks:
  - College
  - Ecommerce
  - Restaurant
- Each track has two levels:
  - Schema level: must write CREATE TABLE + enough INSERT statements
  - Query level: must write the expected analytical query

## Neon Setup (Official Serverless Driver)

This project uses the Neon serverless driver package `@neondatabase/serverless` with `DATABASE_URL`, following Neon docs usage.

1. Create a Neon project and copy the pooled connection string.
2. Create `.env.local` in the project root:

```bash
DATABASE_URL="postgresql://<user>:<password>@<host>/<dbname>?sslmode=require"
```

3. Install dependencies and run:

```bash
npm install
npm run dev
```

When the app first receives requests, it auto-creates these tables in Neon if missing:

- `app_users`
- `app_sessions`
- `app_progress`

## Local Development

```bash
npm run dev
```

Open `http://localhost:3000`.

## Notes

- Schema validation checks structure plus minimum INSERT counts.
- Query execution runs against an in-memory SQL runtime seeded with task data.
- Progress and accounts persist in Neon.
