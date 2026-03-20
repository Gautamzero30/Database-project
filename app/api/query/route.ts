import { NextRequest, NextResponse } from "next/server";
import { QueryExecutionResult } from "@/types";
import {
  executeSQLQuery,
  initializeDatabase,
  insertSampleData,
} from "@/lib/db";

export const runtime = "nodejs";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Internal server error";
}

/**
 * POST /api/query
 * Execute a SQL query against provided schema
 */
export async function POST(request: NextRequest) {
  try {
    const { query, schema, sampleData, expectedQuery } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    if (!schema || !Array.isArray(schema)) {
      return NextResponse.json(
        { error: "Schema is required and must be an array" },
        { status: 400 },
      );
    }

    // Validate the query
    const validationResult = validateQuery(query);
    if (!validationResult.valid) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 },
      );
    }

    const db = await initializeDatabase(schema);

    if (Array.isArray(sampleData) && sampleData.length > 0) {
      await insertSampleData(db, sampleData);
    }

    const result: QueryExecutionResult = await executeSQLQuery(db, query);

    if (result.success && expectedQuery) {
      const normalizedUser = normalizeQuery(query);
      const normalizedExpected = normalizeQuery(expectedQuery);

      (result as QueryExecutionResult & { isExpected?: boolean }).isExpected =
        normalizedUser === normalizedExpected;
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

function normalizeQuery(query: string) {
  return query.trim().replace(/;+$/g, "").replace(/\s+/g, " ").toLowerCase();
}

function validateQuery(query: string): { valid: boolean; error?: string } {
  const trimmedQuery = query.trim().toUpperCase();

  // Must be SELECT query
  if (!trimmedQuery.startsWith("SELECT")) {
    return { valid: false, error: "Only SELECT queries are allowed" };
  }

  // Block dangerous keywords
  const dangerousPatterns = [
    /\bDROP\s+/,
    /\bDELETE\s+/,
    /\bUPDATE\s+/,
    /\bINSERT\s+/,
    /\bALTER\s+/,
    /\bCREATE\s+/,
    /\bTRUNCATE\s+/,
    /\bEXEC\s+/,
    /\bEXECUTE\s+/,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(trimmedQuery)) {
      const keyword = trimmedQuery.match(pattern)?.[0] || "UNKNOWN";
      return {
        valid: false,
        error: `${keyword.trim()} operations are not allowed`,
      };
    }
  }

  // Basic syntax validation
  if (query.includes(";") && !query.trim().endsWith(";")) {
    return { valid: false, error: "Invalid query syntax" };
  }

  return { valid: true };
}
