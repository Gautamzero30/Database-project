import { NextRequest, NextResponse } from "next/server";
import { LEVELS } from "../../../lib/levels";
import { Level } from "@/types";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Internal server error";
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const levelId = url.searchParams.get("id");

    if (levelId) {
      // Get specific level
      const level = LEVELS.find((l: Level) => l.id === levelId);
      if (!level) {
        return NextResponse.json({ error: "Level not found" }, { status: 404 });
      }
      return NextResponse.json(level, {
        headers: {
          "Cache-Control": "public, max-age=300, stale-while-revalidate=1800",
        },
      });
    }

    // Get all levels grouped by world
    const grouped = LEVELS.reduce(
      (acc: Record<number, Level[]>, level: Level) => {
        if (!acc[level.world]) {
          acc[level.world] = [];
        }
        acc[level.world].push(level);
        return acc;
      },
      {} as Record<number, Level[]>,
    );

    Object.values(grouped).forEach((worldLevels) => {
      worldLevels.sort((a, b) => a.id.localeCompare(b.id));
    });

    return NextResponse.json(grouped, {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=1800",
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
