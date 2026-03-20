import { NextRequest, NextResponse } from "next/server";
import {
  clearSessionCookie,
  deleteSessionByToken,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Internal server error";
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      await deleteSessionByToken(token);
    }

    const response = NextResponse.json({ success: true });
    clearSessionCookie(response);
    return response;
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
