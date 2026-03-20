import bcrypt from "bcryptjs";
import { randomUUID, createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { ensureAppSchema, sql } from "@/lib/neon";

export const SESSION_COOKIE_NAME = "sql_dungeon_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export async function createSession(userId: string) {
  await ensureAppSchema();

  const sessionId = randomUUID();
  const rawToken = randomUUID();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await sql`
    INSERT INTO app_sessions (id, user_id, token_hash, expires_at)
    VALUES (${sessionId}, ${userId}, ${tokenHash}, ${expiresAt.toISOString()})
  `;

  return { rawToken, expiresAt };
}

export async function deleteSessionByToken(token: string) {
  await ensureAppSchema();
  await sql`DELETE FROM app_sessions WHERE token_hash = ${hashToken(token)}`;
}

export async function getCurrentUserFromRequest(request: NextRequest) {
  await ensureAppSchema();
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const tokenHash = hashToken(token);

  const rows = (await sql`
    SELECT u.id, u.name, u.email, s.expires_at
    FROM app_sessions s
    JOIN app_users u ON u.id = s.user_id
    WHERE s.token_hash = ${tokenHash}
    LIMIT 1
  `) as Array<{
    id: string;
    name: string;
    email: string;
    expires_at: string;
  }>;

  const session = rows[0];
  if (!session) {
    return null;
  }

  if (new Date(session.expires_at).getTime() < Date.now()) {
    await sql`DELETE FROM app_sessions WHERE token_hash = ${tokenHash}`;
    return null;
  }

  return {
    id: session.id,
    name: session.name,
    email: session.email,
  };
}

export function attachSessionCookie(
  response: NextResponse,
  rawToken: string,
  expiresAt: Date,
) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: rawToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  });
}
