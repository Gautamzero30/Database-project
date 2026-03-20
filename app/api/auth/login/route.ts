import { NextRequest, NextResponse } from "next/server";
import { attachSessionCookie, createSession, verifyPassword } from "@/lib/auth";
import { ensureAppSchema, sql } from "@/lib/neon";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Internal server error";
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "email and password are required" },
        { status: 400 },
      );
    }

    await ensureAppSchema();

    const normalizedEmail = String(email).toLowerCase().trim();
    const rows = (await sql`
      SELECT id, name, email, password_hash
      FROM app_users
      WHERE email = ${normalizedEmail}
      LIMIT 1
    `) as Array<{
      id: string;
      name: string;
      email: string;
      password_hash: string;
    }>;

    const user = rows[0];

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const ok = await verifyPassword(String(password), user.password_hash);
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const { rawToken, expiresAt } = await createSession(user.id);

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
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
