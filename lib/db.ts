import { TableSchema, QueryExecutionResult } from "@/types";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

type SQLStatement = {
  step(): boolean;
  getAsObject(): Record<string, unknown>;
  free(): void;
};

type SQLDatabase = {
  run(sql: string, params?: unknown[]): void;
  prepare(sql: string): SQLStatement;
};

type SQLFactoryModule = {
  default?: () => Promise<{ Database: new () => SQLDatabase }>;
  (): Promise<{ Database: new () => SQLDatabase }>;
};

async function createSqlJsDatabase(): Promise<SQLDatabase> {
  const sqlImportUnknown = require("sql.js/dist/sql-asm.js") as unknown;

  if (typeof sqlImportUnknown === "function") {
    const SQL = await (sqlImportUnknown as SQLFactoryModule)();
    return new SQL.Database();
  }

  if (
    typeof sqlImportUnknown === "object" &&
    sqlImportUnknown !== null &&
    typeof (sqlImportUnknown as { default?: unknown }).default === "function"
  ) {
    const SQL = await (
      sqlImportUnknown as {
        default: () => Promise<{ Database: new () => SQLDatabase }>;
      }
    ).default();
    return new SQL.Database();
  }

  throw new Error("Unable to initialize SQL engine");
}

export async function initializeDatabase(
  schema: TableSchema[],
): Promise<SQLDatabase> {
  const db = await createSqlJsDatabase();

  // Create tables and add sample data
  schema.forEach((table) => {
    const columns = table.columns
      .map((col) => {
        let colDef = `${col.name} ${col.type}`;
        if (col.isPrimary) colDef += " PRIMARY KEY";
        if (!col.isNullable && !col.isPrimary) colDef += " NOT NULL";
        return colDef;
      })
      .join(", ");

    const createTableSQL = `CREATE TABLE ${table.name} (${columns})`;
    db.run(createTableSQL);
  });

  return db;
}

// Execute a SQL query against the database
export async function executeSQLQuery(
  db: SQLDatabase,
  query: string,
): Promise<QueryExecutionResult> {
  const startTime = Date.now();

  try {
    // Validate query
    if (!query.trim().toUpperCase().startsWith("SELECT")) {
      return {
        success: false,
        error: "Only SELECT queries are allowed",
        executionTime: Date.now() - startTime,
      };
    }

    // Block dangerous keywords
    const dangerousKeywords = [
      "DROP",
      "DELETE",
      "UPDATE",
      "INSERT",
      "ALTER",
      "CREATE",
    ];
    const upperQuery = query.toUpperCase();

    for (const keyword of dangerousKeywords) {
      if (upperQuery.includes(keyword) && !upperQuery.startsWith("SELECT")) {
        return {
          success: false,
          error: `${keyword} operations are not allowed`,
          executionTime: Date.now() - startTime,
        };
      }
    }

    // Execute query with timeout
    const result = await Promise.race([
      executeQueryWithDb(db, query),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Query timeout")), 5000),
      ),
    ]);

    return result as QueryExecutionResult;
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Query execution failed",
      executionTime: Date.now() - startTime,
    };
  }
}

async function executeQueryWithDb(
  db: SQLDatabase,
  query: string,
): Promise<QueryExecutionResult> {
  const startTime = Date.now();

  try {
    const stmt = db.prepare(query);
    const results: Array<Record<string, unknown>> = [];
    const columns: string[] = [];

    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push(row);

      if (columns.length === 0) {
        columns.push(...Object.keys(row));
      }
    }

    stmt.free();

    return {
      success: true,
      data: results,
      columns: columns,
      executionTime: Date.now() - startTime,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Query execution failed",
      executionTime: Date.now() - startTime,
    };
  }
}

// Parse SQL schema from user input
export function parseSchemaFromSQL(sql: string): TableSchema[] {
  // This is a simplified parser. For production, use a proper SQL parser
  const tables: TableSchema[] = [];
  const tableMatches = sql.matchAll(/CREATE\s+TABLE\s+(\w+)\s*\((.*?)\);/gi);

  for (const match of tableMatches) {
    const tableName = match[1];
    const columnsDef = match[2];
    const columns = columnsDef.split(",").map((col) => {
      const parts = col.trim().split(/\s+/);
      const name = parts[0];
      const type = parts[1].toUpperCase() as
        | "INT"
        | "VARCHAR"
        | "TEXT"
        | "DATE"
        | "FLOAT"
        | "BOOLEAN";
      const isPrimary = parts.includes("PRIMARY");
      const isForeign = parts.includes("FOREIGN");

      return {
        name,
        type,
        isPrimary,
        isForeign,
      };
    });

    tables.push({ name: tableName, columns });
  }

  return tables;
}

// Insert sample data into database
export async function insertSampleData(
  db: SQLDatabase,
  data: Array<{ table: string; values: Record<string, unknown> }>,
): Promise<void> {
  for (const record of data) {
    const tableName = record.table;
    const values = record.values;

    const columns = Object.keys(values).join(", ");
    const placeholders = Object.keys(values)
      .map(() => "?")
      .join(", ");
    const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;

    db.run(sql, Object.values(values));
  }
}
