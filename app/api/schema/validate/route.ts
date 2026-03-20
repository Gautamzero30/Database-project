import { NextRequest, NextResponse } from "next/server";
import { Pool } from "@neondatabase/serverless";
import { TableSchema, Column } from "@/types";
import { compareSchemas } from "@/lib/comparison";
import { getCurrentUserFromRequest } from "@/lib/auth";

interface ValidationRequest {
  mode?: "create" | "insert";
  levelId?: string;
  createTableStatements?: string;
  insertStatements?: string;
  expectedSchema: TableSchema[];
  requiredInserts?: Record<string, number>;
}

interface ExecutionSummary {
  success: boolean;
  statementCount: number;
  executedCreateTables: string[];
  insertCounts: Record<string, number>;
  error?: string;
}

type SQLDatabase = {
  run(sql: string): void;
};

type SQLModule = {
  Database: new () => SQLDatabase;
};

interface NeonExecutionSummary {
  success: boolean;
  schemaName?: string;
  statementCount: number;
  executedCreateTables: string[];
  insertCounts: Record<string, number>;
  error?: string;
}

function splitStatements(sql: string): string[] {
  return sql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
}

function sanitizeIdentifier(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .slice(0, 45);
}

function getUserLevelSchemaName(userId: string, levelId: string): string {
  const userPart = sanitizeIdentifier(userId);
  const levelPart = sanitizeIdentifier(levelId);
  return `task_${userPart}_${levelPart}`.slice(0, 63);
}

function statementType(statement: string): "create" | "insert" | "other" {
  const normalized = statement.trim().toUpperCase();
  if (normalized.startsWith("CREATE TABLE")) return "create";
  if (normalized.startsWith("INSERT INTO")) return "insert";
  return "other";
}

function validateAllowedStatements(
  statements: string[],
  mode: "create" | "insert",
): { valid: boolean; error?: string } {
  for (const statement of statements) {
    const kind = statementType(statement);
    if (mode === "create" && kind !== "create") {
      return {
        valid: false,
        error: "Create step only allows CREATE TABLE statements.",
      };
    }

    if (mode === "insert" && kind !== "insert") {
      return {
        valid: false,
        error: "Insert step only allows INSERT INTO statements.",
      };
    }
  }

  return { valid: true };
}

function buildBaseComparison() {
  return {
    isCorrect: false,
    correctTables: [] as string[],
    missingTables: [] as string[],
    extraTables: [] as string[],
    incorrectColumns: [] as Array<{ table: string; issues: string[] }>,
    missingForeignKeys: [] as Array<{ from: string; to: string }>,
    extraForeignKeys: [] as Array<{ from: string; to: string }>,
    issues: [] as string[],
    score: 0,
  };
}

async function executeSchemaSQL(
  sqlText: string,
  mode: "create" | "insert",
): Promise<ExecutionSummary> {
  const statements = splitStatements(sqlText);
  const allowed = validateAllowedStatements(statements, mode);
  if (!allowed.valid) {
    return {
      success: false,
      statementCount: statements.length,
      executedCreateTables: [],
      insertCounts: {},
      error: allowed.error,
    };
  }

  const createdTables: string[] = [];
  const insertCounts: Record<string, number> = {};

  try {
    for (const statement of statements) {
      const kind = statementType(statement);

      if (kind === "create") {
        const tableMatch = statement.match(
          /create\s+table\s+(?:if\s+not\s+exists\s+)?(\w+)/i,
        );
        if (tableMatch) {
          createdTables.push(tableMatch[1].toLowerCase());
        }
        continue;
      }

      if (kind === "insert") {
        const tableMatch = statement.match(/insert\s+into\s+(\w+)/i);
        if (tableMatch) {
          const tableName = tableMatch[1].toLowerCase();
          insertCounts[tableName] = (insertCounts[tableName] || 0) + 1;
        }
        continue;
      }

      return {
        success: false,
        statementCount: statements.length,
        executedCreateTables: createdTables,
        insertCounts,
        error: "Unsupported SQL statement for this step.",
      };
    }

    return {
      success: true,
      statementCount: statements.length,
      executedCreateTables: createdTables,
      insertCounts,
    };
  } catch (error) {
    return {
      success: false,
      statementCount: statements.length,
      executedCreateTables: createdTables,
      insertCounts,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function executeNeonSQL(params: {
  sqlText: string;
  mode: "create" | "insert";
  schemaName: string;
}): Promise<NeonExecutionSummary> {
  const { sqlText, mode, schemaName } = params;
  const statements = splitStatements(sqlText);

  const allowed = validateAllowedStatements(statements, mode);
  if (!allowed.valid) {
    return {
      success: false,
      schemaName,
      statementCount: statements.length,
      executedCreateTables: [],
      insertCounts: {},
      error: allowed.error,
    };
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return {
      success: false,
      schemaName,
      statementCount: statements.length,
      executedCreateTables: [],
      insertCounts: {},
      error: "DATABASE_URL is not configured.",
    };
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();
  const executedCreateTables: string[] = [];
  const insertCounts: Record<string, number> = {};

  try {
    await client.query("BEGIN");

    if (mode === "create") {
      await client.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
      await client.query(`CREATE SCHEMA "${schemaName}"`);
    } else {
      await client.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
    }

    await client.query(`SET search_path TO "${schemaName}", public`);

    for (const statement of statements) {
      await client.query(statement);
      const kind = statementType(statement);

      if (kind === "create") {
        const tableMatch = statement.match(
          /create\s+table\s+(?:if\s+not\s+exists\s+)?(\w+)/i,
        );
        if (tableMatch) {
        }
      }

      if (kind === "insert") {
        const tableMatch = statement.match(/insert\s+into\s+(\w+)/i);
        if (tableMatch) {
          const tableName = tableMatch[1].toLowerCase();
          insertCounts[tableName] = (insertCounts[tableName] || 0) + 1;
        }
      }
    }

    await client.query("COMMIT");

    return {
      success: true,
      schemaName,
      statementCount: statements.length,
      executedCreateTables,
      insertCounts,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    return {
      success: false,
      schemaName,
      statementCount: statements.length,
      executedCreateTables,
      insertCounts,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    client.release();
    await pool.end();
  }
}

function parseInsertCounts(sql: string): Record<string, number> {
  const counts: Record<string, number> = {};
  const matches = sql.matchAll(/insert\s+into\s+(\w+)/gi);

  for (const match of matches) {
    const table = match[1].toLowerCase();
    counts[table] = (counts[table] || 0) + 1;
  }

  return counts;
}

/**
 * Parse CREATE TABLE SQL statements into TableSchema objects
 */
function parseCreateTableStatements(sql: string): TableSchema[] {
  const tables: TableSchema[] = [];

  // Split by semicolon to get individual statements
  const statements = sql.split(";").filter((s) => s.trim());

  for (const statement of statements) {
    const trimmed = statement.trim();
    if (!trimmed.toLowerCase().startsWith("create table")) {
      continue;
    }

    // Extract table name: CREATE TABLE [IF NOT EXISTS] table_name (
    const tableNameMatch = trimmed.match(
      /create\s+table\s+(?:if\s+not\s+exists\s+)?(\w+)\s*\(/i,
    );
    if (!tableNameMatch) continue;

    const tableName = tableNameMatch[1].toLowerCase();

    // Extract columns and constraints
    const columnsMatch = trimmed.match(/\((.*)\)/s);
    if (!columnsMatch) continue;

    const columnsStr = columnsMatch[1];
    const columns: Column[] = [];

    // Split by comma, but be careful with function calls like AUTO_INCREMENT
    const lines = columnsStr.split(",").map((line) => line.trim());

    for (const line of lines) {
      if (!line) continue;

      // Skip constraint lines that don't define columns
      if (
        line.toLowerCase().startsWith("primary key") ||
        line.toLowerCase().startsWith("unique") ||
        line.toLowerCase().startsWith("index") ||
        line.toLowerCase().startsWith("check")
      ) {
        continue;
      }

      // FOREIGN KEY constraints
      if (line.toLowerCase().startsWith("foreign key")) {
        // Parse: FOREIGN KEY (column_name) REFERENCES other_table(other_column)
        const fkMatch = line.match(
          /foreign\s+key\s*\((\w+)\)\s+references\s+(\w+)\s*\((\w+)\)/i,
        );
        if (fkMatch) {
          const colName = fkMatch[1].toLowerCase();
          const refTable = fkMatch[2].toLowerCase();
          const refColumn = fkMatch[3].toLowerCase();

          // Find the column and update it
          const col = columns.find((c) => c.name === colName);
          if (col) {
            col.isForeign = true;
            col.references = { table: refTable, column: refColumn };
          }
        }
        continue;
      }

      // Regular column definition: name TYPE [modifiers]
      const parts = line.split(/\s+/);
      if (parts.length < 2) continue;

      const colName = parts[0].toLowerCase();
      const colType = parseColumnType(parts[1].toUpperCase());

      const column: Column = {
        name: colName,
        type: colType,
        isNullable: true,
      };

      // Check for PRIMARY KEY constraint
      if (line.toUpperCase().includes("PRIMARY KEY")) {
        column.isPrimary = true;
        column.isNullable = false;
      }

      // Check for NOT NULL
      if (line.toUpperCase().includes("NOT NULL")) {
        column.isNullable = false;
      }

      // Check for REFERENCES (inline foreign key)
      const refMatch = line.match(/references\s+(\w+)\s*\((\w+)\)/i);
      if (refMatch) {
        column.isForeign = true;
        column.references = {
          table: refMatch[1].toLowerCase(),
          column: refMatch[2].toLowerCase(),
        };
      }

      columns.push(column);
    }

    if (columns.length > 0) {
      tables.push({ name: tableName, columns });
    }
  }

  return tables;
}

/**
 * Map SQL type to our type system
 */
function parseColumnType(
  sqlType: string,
): "INT" | "VARCHAR" | "TEXT" | "DATE" | "FLOAT" | "BOOLEAN" {
  const typeMap: {
    [key: string]: "INT" | "VARCHAR" | "TEXT" | "DATE" | "FLOAT" | "BOOLEAN";
  } = {
    INT: "INT",
    INTEGER: "INT",
    BIGINT: "INT",
    SMALLINT: "INT",
    VARCHAR: "VARCHAR",
    CHAR: "VARCHAR",
    TEXT: "TEXT",
    LONGTEXT: "TEXT",
    DATE: "DATE",
    DATETIME: "DATE",
    TIMESTAMP: "DATE",
    FLOAT: "FLOAT",
    DOUBLE: "FLOAT",
    DECIMAL: "FLOAT",
    BOOLEAN: "BOOLEAN",
    BOOL: "BOOLEAN",
  };

  const normalized = sqlType.split("(")[0].toUpperCase();
  return typeMap[normalized] || "VARCHAR";
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: ValidationRequest = await request.json();
    const {
      mode = "create",
      levelId,
      createTableStatements,
      insertStatements,
      expectedSchema,
      requiredInserts,
    } = body;

    if (!expectedSchema || !Array.isArray(expectedSchema)) {
      return NextResponse.json(
        { error: "Missing expectedSchema" },
        { status: 400 },
      );
    }

    if (!levelId) {
      return NextResponse.json(
        { error: "Missing levelId for Neon schema namespace" },
        { status: 400 },
      );
    }

    const schemaName = getUserLevelSchemaName(user.id, levelId);

    if (mode === "create" && !createTableStatements?.trim()) {
      return NextResponse.json(
        { error: "Missing createTableStatements" },
        { status: 400 },
      );
    }

    if (mode === "insert" && !insertStatements?.trim()) {
      return NextResponse.json(
        { error: "Missing insertStatements" },
        { status: 400 },
      );
    }

    const createSQL = createTableStatements ?? "";
    const insertSQL = insertStatements ?? "";

    const schemaComparison = compareSchemas(
      parseCreateTableStatements(createSQL),
      expectedSchema,
    );

    const schemaReadyForInsert =
      schemaComparison.missingTables.length === 0 &&
      schemaComparison.extraTables.length === 0 &&
      schemaComparison.incorrectColumns.length === 0 &&
      schemaComparison.missingForeignKeys.length === 0;

    if (!schemaReadyForInsert) {
      return NextResponse.json({
        ...schemaComparison,
        execution: {
          success: false,
          statementCount: 0,
          executedCreateTables: [],
          insertCounts: {},
          error: "Schema structure is not complete yet.",
        },
        neon: {
          success: false,
          schemaName,
          statementCount: 0,
          executedCreateTables: [],
          insertCounts: {},
          error:
            "Neon execution skipped because schema does not match expected tables yet.",
        },
        mode,
        schemaReadyForInsert,
        insertCounts: {},
        missingInsertIssues: [],
      });
    }

    if (mode === "create") {
      const execution = await executeSchemaSQL(createSQL, "create");

      if (!execution.success) {
        const comparison = buildBaseComparison();
        comparison.issues.push(
          execution.error || "Failed to execute CREATE TABLE SQL",
        );

        return NextResponse.json(
          {
            ...comparison,
            execution,
            neon: {
              success: false,
              schemaName,
              statementCount: 0,
              executedCreateTables: [],
              insertCounts: {},
              error: "Neon execution skipped because SQL failed in parser",
            },
            mode,
            schemaReadyForInsert,
            insertCounts: {},
            missingInsertIssues: [],
          },
          { status: 400 },
        );
      }

      const neonExecution = await executeNeonSQL({
        sqlText: createSQL,
        mode: "create",
        schemaName,
      });

      const response = {
        ...schemaComparison,
        isCorrect: false,
        issues: [
          ...schemaComparison.issues,
          "Tables created. Next: add INSERT statements in the Insert Data step.",
        ],
        execution,
        neon: neonExecution,
        mode,
        schemaReadyForInsert: schemaReadyForInsert && neonExecution.success,
        insertCounts: {},
        missingInsertIssues: [],
      };

      return NextResponse.json(response, {
        status: neonExecution.success ? 200 : 400,
      });
    }

    const execution = await executeSchemaSQL(insertSQL, "insert");

    if (!execution.success) {
      const comparison = buildBaseComparison();
      comparison.issues.push(execution.error || "Failed to execute INSERT SQL");

      return NextResponse.json(
        {
          ...comparison,
          execution,
          neon: {
            success: false,
            schemaName,
            statementCount: 0,
            executedCreateTables: [],
            insertCounts: {},
            error: "Neon execution skipped because SQL failed in parser",
          },
          mode,
          schemaReadyForInsert,
          insertCounts: {},
          missingInsertIssues: [],
        },
        { status: 400 },
      );
    }

    const neonExecution = await executeNeonSQL({
      sqlText: insertSQL,
      mode: "insert",
      schemaName,
    });

    const insertCounts = parseInsertCounts(insertSQL);
    const missingInsertIssues: string[] = [];

    if (requiredInserts) {
      for (const [table, requiredCount] of Object.entries(requiredInserts)) {
        const actual = insertCounts[table.toLowerCase()] || 0;
        if (actual < requiredCount) {
          missingInsertIssues.push(
            `${table}: expected at least ${requiredCount} INSERT statements, found ${actual}`,
          );
        }
      }
    }

    const finalIsCorrect =
      schemaReadyForInsert &&
      missingInsertIssues.length === 0 &&
      execution.success &&
      neonExecution.success;

    const scorePenalty = missingInsertIssues.length * 10;
    const finalScore = Math.max(0, schemaComparison.score - scorePenalty);

    return NextResponse.json(
      {
        ...schemaComparison,
        isCorrect: finalIsCorrect,
        score: finalScore,
        issues:
          missingInsertIssues.length > 0
            ? [
                ...schemaComparison.issues,
                ...missingInsertIssues.map(
                  (issue) => `Insufficient inserts for ${issue}`,
                ),
              ]
            : schemaComparison.issues,
        execution,
        neon: neonExecution,
        mode,
        schemaReadyForInsert,
        insertCounts,
        missingInsertIssues,
      },
      { status: finalIsCorrect ? 200 : 400 },
    );
  } catch (error) {
    console.error("Schema validation error:", error);
    return NextResponse.json(
      {
        error: "Failed to validate schema",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
