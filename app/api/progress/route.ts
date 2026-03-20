import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { ensureAppSchema, sql } from "@/lib/neon";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Internal server error";
}

/**
 * POST /api/progress/save
 * Save user progress for a level
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { levelId, completed, xpEarned, schema, query, hintsUsed } =
      await request.json();

    if (!levelId) {
      return NextResponse.json(
        { error: "levelId is required" },
        { status: 400 },
      );
    }

    await ensureAppSchema();

    const completedValue = Boolean(completed);
    const xpValue = Number(xpEarned || 0);
    const hintsValue = Number(hintsUsed || 0);
    const schemaText = schema ? JSON.stringify(schema) : null;

    await sql`
      INSERT INTO app_progress (
        user_id,
        level_id,
        completed,
        xp_earned,
        attempt_count,
        hints,
        last_schema,
        last_query,
        completed_at,
        updated_at
      ) VALUES (
        ${user.id},
        ${String(levelId)},
        ${completedValue},
        ${xpValue},
        1,
        ${hintsValue},
        ${schemaText},
        ${query || null},
        ${completedValue ? new Date().toISOString() : null},
        NOW()
      )
      ON CONFLICT (user_id, level_id)
      DO UPDATE SET
        completed = app_progress.completed OR EXCLUDED.completed,
        xp_earned = GREATEST(app_progress.xp_earned, EXCLUDED.xp_earned),
        attempt_count = app_progress.attempt_count + 1,
        hints = GREATEST(app_progress.hints, EXCLUDED.hints),
        last_schema = COALESCE(EXCLUDED.last_schema, app_progress.last_schema),
        last_query = COALESCE(EXCLUDED.last_query, app_progress.last_query),
        completed_at = CASE
          WHEN EXCLUDED.completed THEN NOW()
          ELSE app_progress.completed_at
        END,
        updated_at = NOW()
    `;

    const rows = (await sql`
      SELECT user_id, level_id, completed, xp_earned, attempt_count, hints, last_schema, last_query, completed_at
      FROM app_progress
      WHERE user_id = ${user.id} AND level_id = ${String(levelId)}
      LIMIT 1
    `) as Array<{
      user_id: string;
      level_id: string;
      completed: boolean;
      xp_earned: number;
      attempt_count: number;
      hints: number;
      last_schema: string | null;
      last_query: string | null;
      completed_at: string | null;
    }>;

    const row = rows[0];
    const progress = row
      ? {
          userId: row.user_id,
          levelId: row.level_id,
          completed: row.completed,
          xpEarned: row.xp_earned,
          attemptCount: row.attempt_count,
          hints: row.hints,
          schema: row.last_schema ? JSON.parse(row.last_schema) : undefined,
          query: row.last_query || undefined,
          completedAt: row.completed_at
            ? new Date(row.completed_at)
            : undefined,
        }
      : null;

    // Return the saved progress
    return NextResponse.json({
      success: true,
      progress,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

/**
 * GET /api/progress?userId=:userId&levelId=:levelId
 * Get user progress for a specific level
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureAppSchema();

    const url = new URL(request.url);
    const levelId = url.searchParams.get("levelId");

    if (levelId) {
      const rows = (await sql`
        SELECT user_id, level_id, completed, xp_earned, attempt_count, hints, last_schema, last_query, completed_at
        FROM app_progress
        WHERE user_id = ${user.id} AND level_id = ${String(levelId)}
        LIMIT 1
      `) as Array<{
        user_id: string;
        level_id: string;
        completed: boolean;
        xp_earned: number;
        attempt_count: number;
        hints: number;
        last_schema: string | null;
        last_query: string | null;
        completed_at: string | null;
      }>;

      const row = rows[0];
      if (!row) {
        return NextResponse.json({
          userId: user.id,
          levelId,
          completed: false,
          xpEarned: 0,
          attemptCount: 0,
          hints: 0,
        });
      }

      return NextResponse.json({
        userId: row.user_id,
        levelId: row.level_id,
        completed: row.completed,
        xpEarned: row.xp_earned,
        attemptCount: row.attempt_count,
        hints: row.hints,
        schema: row.last_schema ? JSON.parse(row.last_schema) : undefined,
        query: row.last_query || undefined,
        completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      });
    }

    const rows = (await sql`
      SELECT user_id, level_id, completed, xp_earned, attempt_count, hints, last_schema, last_query, completed_at
      FROM app_progress
      WHERE user_id = ${user.id}
    `) as Array<{
      user_id: string;
      level_id: string;
      completed: boolean;
      xp_earned: number;
      attempt_count: number;
      hints: number;
      last_schema: string | null;
      last_query: string | null;
      completed_at: string | null;
    }>;

    type ProgressResponse = {
      userId: string;
      levelId: string;
      completed: boolean;
      xpEarned: number;
      attemptCount: number;
      hints: number;
      schema?: unknown;
      query?: string;
      completedAt?: Date;
    };

    const progressByLevel: Record<string, ProgressResponse> = {};
    let totalXP = 0;

    rows.forEach((row) => {
      const progress = {
        userId: row.user_id,
        levelId: row.level_id,
        completed: row.completed,
        xpEarned: row.xp_earned,
        attemptCount: row.attempt_count,
        hints: row.hints,
        schema: row.last_schema ? JSON.parse(row.last_schema) : undefined,
        query: row.last_query || undefined,
        completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      };
      progressByLevel[row.level_id] = progress;
      if (row.completed) {
        totalXP += row.xp_earned;
      }
    });

    return NextResponse.json({
      progress: progressByLevel,
      totalXP,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
