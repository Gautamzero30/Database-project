import { NextRequest, NextResponse } from "next/server";
import { compareSchemas, validateSchema } from "@/lib/comparison";
import { generateERDFromSchema, compareERDs } from "@/lib/erd";
import { TableSchema, ERD } from "@/types";

/**
 * POST /api/schema/compare
 * Compare user's schema with the expected schema
 */
export async function POST(request: NextRequest) {
  try {
    const { userSchema, expectedSchema } = await request.json();

    if (!userSchema || !Array.isArray(userSchema)) {
      return NextResponse.json(
        { error: "User schema is required and must be an array of tables" },
        { status: 400 },
      );
    }

    if (!expectedSchema || !Array.isArray(expectedSchema)) {
      return NextResponse.json(
        { error: "Expected schema is required and must be an array of tables" },
        { status: 400 },
      );
    }

    // Validate user schema
    const validation = validateSchema(userSchema);
    if (!validation.valid) {
      return NextResponse.json(
        { errors: validation.errors, isValid: false },
        { status: 400 },
      );
    }

    // Compare schemas
    const comparisonResult = compareSchemas(
      userSchema as TableSchema[],
      expectedSchema as TableSchema[],
    );

    // Generate ERDs
    const userERD = generateERDFromSchema(userSchema as TableSchema[]);
    const expectedERD = generateERDFromSchema(expectedSchema as TableSchema[]);
    const erdComparison = compareERDs(userERD, expectedERD);

    return NextResponse.json({
      isValid: true,
      schemaComparison: comparisonResult,
      erdComparison,
      userERD,
      expectedERD,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
