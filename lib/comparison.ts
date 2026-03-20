import { TableSchema, ComparisonResult } from "@/types";

/**
 * Compare user's schema with the expected schema
 */
export function compareSchemas(
  userSchema: TableSchema[],
  expectedSchema: TableSchema[],
): ComparisonResult {
  const userTableNames = new Set(userSchema.map((t) => t.name));
  const expectedTableNames = new Set(expectedSchema.map((t) => t.name));

  // Find missing and extra tables
  const missingTables = Array.from(expectedTableNames).filter(
    (name) => !userTableNames.has(name),
  );
  const extraTables = Array.from(userTableNames).filter(
    (name) => !expectedTableNames.has(name),
  );
  const correctTables = Array.from(expectedTableNames).filter((name) =>
    userTableNames.has(name),
  );

  // Compare columns and constraints
  const incorrectColumns: { table: string; issues: string[] }[] = [];
  const missingForeignKeys: { from: string; to: string }[] = [];
  const extraForeignKeys: { from: string; to: string }[] = [];

  expectedSchema.forEach((expectedTable) => {
    const userTable = userSchema.find((t) => t.name === expectedTable.name);

    if (!userTable) return;

    const userColNames = new Set(userTable.columns.map((c) => c.name));
    const expectedColNames = new Set(expectedTable.columns.map((c) => c.name));

    // Check for missing/extra columns
    const missingCols = Array.from(expectedColNames).filter(
      (name) => !userColNames.has(name),
    );
    const extraCols = Array.from(userColNames).filter(
      (name) => !expectedColNames.has(name),
    );

    if (missingCols.length > 0 || extraCols.length > 0) {
      const issues: string[] = [];

      if (missingCols.length > 0) {
        issues.push(`Missing columns: ${missingCols.join(", ")}`);
      }
      if (extraCols.length > 0) {
        issues.push(`Extra columns: ${extraCols.join(", ")}`);
      }

      incorrectColumns.push({ table: expectedTable.name, issues });
    }

    // Check primary key
    const expectedPK = expectedTable.columns.find((c) => c.isPrimary);
    const userPK = userTable.columns.find((c) => c.isPrimary);

    if (expectedPK && !userPK) {
      const existing = incorrectColumns.find(
        (ic) => ic.table === expectedTable.name,
      );
      if (existing) {
        existing.issues.push(`Missing primary key: ${expectedPK.name}`);
      } else {
        incorrectColumns.push({
          table: expectedTable.name,
          issues: [`Missing primary key: ${expectedPK.name}`],
        });
      }
    }

    // Check foreign keys
    const expectedForeignKeys = expectedTable.columns.filter(
      (c) => c.isForeign,
    );
    const userForeignKeys = userTable.columns.filter((c) => c.isForeign);

    expectedForeignKeys.forEach((expectedFK) => {
      const userFK = userForeignKeys.find((fk) => fk.name === expectedFK.name);

      if (!userFK) {
        missingForeignKeys.push({
          from: `${expectedTable.name}.${expectedFK.name}`,
          to: expectedFK.references
            ? `${expectedFK.references.table}.${expectedFK.references.column}`
            : "",
        });
      } else if (
        userFK.references?.table !== expectedFK.references?.table ||
        userFK.references?.column !== expectedFK.references?.column
      ) {
        const existing = incorrectColumns.find(
          (ic) => ic.table === expectedTable.name,
        );
        if (existing) {
          existing.issues.push(
            `Incorrect foreign key for ${expectedFK.name}: expected ${expectedFK.references?.table}.${expectedFK.references?.column}`,
          );
        } else {
          incorrectColumns.push({
            table: expectedTable.name,
            issues: [
              `Incorrect foreign key for ${expectedFK.name}: expected ${expectedFK.references?.table}.${expectedFK.references?.column}`,
            ],
          });
        }
      }
    });

    userForeignKeys.forEach((userFK) => {
      const expectedFK = expectedForeignKeys.find(
        (fk) => fk.name === userFK.name,
      );
      if (!expectedFK) {
        extraForeignKeys.push({
          from: `${expectedTable.name}.${userFK.name}`,
          to: userFK.references
            ? `${userFK.references.table}.${userFK.references.column}`
            : "",
        });
      }
    });
  });

  // Calculate score
  const totalExpectedTables = expectedSchema.length;
  const totalExpectedForeignKeys = expectedSchema.reduce(
    (count, table) => count + table.columns.filter((c) => c.isForeign).length,
    0,
  );

  const correctTableScore = (correctTables.length / totalExpectedTables) * 100;
  const missingFKPenalty =
    (missingForeignKeys.length / Math.max(totalExpectedForeignKeys, 1)) * 50;
  const extraTablePenalty = extraTables.length * 20; // Penalty per extra table
  const columnIssuesPenalty = incorrectColumns.length * 15;

  const score = Math.max(
    0,
    Math.min(
      100,
      correctTableScore -
        missingFKPenalty -
        extraTablePenalty -
        columnIssuesPenalty,
    ),
  );

  const issues: string[] = [];
  if (missingTables.length > 0) {
    issues.push(`Missing tables: ${missingTables.join(", ")}`);
  }
  if (extraTables.length > 0) {
    issues.push(`Extra tables: ${extraTables.join(", ")}`);
  }
  if (missingForeignKeys.length > 0) {
    issues.push(`Missing ${missingForeignKeys.length} foreign key(s)`);
  }
  if (extraForeignKeys.length > 0) {
    issues.push(`Extra ${extraForeignKeys.length} foreign key(s)`);
  }
  if (incorrectColumns.length > 0) {
    issues.push(`Column issues in ${incorrectColumns.length} table(s)`);
  }

  return {
    isCorrect: score >= 90,
    correctTables,
    missingTables,
    extraTables,
    incorrectColumns,
    missingForeignKeys,
    extraForeignKeys,
    issues,
    score: Math.round(score),
  };
}

/**
 * Validate a schema structure
 */
export function validateSchema(schema: TableSchema[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const tableNames = new Set<string>();

  schema.forEach((table) => {
    // Check for duplicate table names
    if (tableNames.has(table.name)) {
      errors.push(`Duplicate table name: ${table.name}`);
    }
    tableNames.add(table.name);

    // Check columns
    const columnNames = new Set<string>();
    let hasPrimaryKey = false;

    table.columns.forEach((col) => {
      // Check for duplicate column names
      if (columnNames.has(col.name)) {
        errors.push(`Duplicate column in ${table.name}: ${col.name}`);
      }
      columnNames.add(col.name);

      // Check primary key
      if (col.isPrimary) {
        if (hasPrimaryKey) {
          errors.push(`Multiple primary keys in ${table.name}`);
        }
        hasPrimaryKey = true;
      }

      // Check foreign key references
      if (col.isForeign && col.references) {
        if (!schema.some((t) => t.name === col.references!.table)) {
          errors.push(
            `Foreign key in ${table.name}.${col.name} references non-existent table: ${col.references.table}`,
          );
        }
      }
    });

    if (!hasPrimaryKey) {
      errors.push(`Table ${table.name} has no primary key`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
