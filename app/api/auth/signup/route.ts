import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { attachSessionCookie, createSession, hashPassword } from "@/lib/auth";
import { ensureAppSchema, sql } from "@/lib/neon";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Internal server error";
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "name, email and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    await ensureAppSchema();

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = (await sql`
      SELECT id FROM app_users
      WHERE email = ${normalizedEmail}
      LIMIT 1
    `) as Array<{ id: string }>;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 409 },
      );
    }

    const userId = randomUUID();
    const passwordHash = await hashPassword(password);

    await sql`
      INSERT INTO app_users (id, name, email, password_hash)
      VALUES (${userId}, ${String(name).trim()}, ${normalizedEmail}, ${passwordHash})
    `;

    const { rawToken, expiresAt } = await createSession(userId);

    const response = NextResponse.json({
      user: { id: userId, name: String(name).trim(), email: normalizedEmail },
    });

    attachSessionCookie(response, rawToken, expiresAt);
    return response;
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
