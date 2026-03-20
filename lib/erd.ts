import { TableSchema, ERD, Column } from "@/types";

/**
 * Generate ERD from a user's schema
 */
export function generateERDFromSchema(tables: TableSchema[]): ERD {
  const nodes = tables.map((table) => ({
    id: table.name,
    label: table.name.charAt(0).toUpperCase() + table.name.slice(1),
  }));

  const edges: any[] = [];
  const edgeSet = new Set<string>();

  tables.forEach((table) => {
    table.columns.forEach((column) => {
      if (column.isForeign && column.references) {
        const edgeKey = `${column.references.table}-${table.name}`;

        if (!edgeSet.has(edgeKey)) {
          edgeSet.add(edgeKey);

          // Detect cardinality
          const isJunctionTable = isJunction(table, tables);
          const type = isJunctionTable ? "M:N" : "1:N";

          edges.push({
            from: column.references.table,
            to: table.name,
            type,
            fromTable: column.references.table,
            toTable: table.name,
          });
        }
      }
    });
  });

  return { nodes, edges };
}

/**
 * Detect if a table is a junction table (for M:N relationships)
 */
function isJunction(table: TableSchema, allTables: TableSchema[]): boolean {
  const foreignKeys = table.columns.filter((c) => c.isForeign);

  // Junction table typically has:
  // 1. Exactly 2 foreign keys
  // 2. Only those columns (optionally + id)
  if (foreignKeys.length !== 2) return false;

  const nonFKColumns = table.columns.filter(
    (c) => !c.isForeign && c.name !== "id",
  );
  return nonFKColumns.length === 0;
}

/**
 * Compare two ERDs and return differences
 */
export function compareERDs(
  userERD: ERD,
  expectedERD: ERD,
): {
  correct: boolean;
  missingNodes: string[];
  extraNodes: string[];
  missingEdges: any[];
  extraEdges: any[];
  incorrectEdgeTypes: any[];
} {
  const userNodeIds = new Set(userERD.nodes.map((n) => n.id));
  const expectedNodeIds = new Set(expectedERD.nodes.map((n) => n.id));

  const missingNodes = Array.from(expectedNodeIds).filter(
    (id) => !userNodeIds.has(id),
  );
  const extraNodes = Array.from(userNodeIds).filter(
    (id) => !expectedNodeIds.has(id),
  );

  // Compare edges
  const userEdges = new Set(userERD.edges.map((e) => `${e.from}-${e.to}`));
  const expectedEdges = new Set(
    expectedERD.edges.map((e) => `${e.from}-${e.to}`),
  );

  const missingEdges = expectedERD.edges.filter(
    (e) => !userEdges.has(`${e.from}-${e.to}`),
  );
  const extraEdges = userERD.edges.filter(
    (e) => !expectedEdges.has(`${e.from}-${e.to}`),
  );

  // Check for incorrect cardinality
  const incorrectEdgeTypes = expectedERD.edges.filter((expectedEdge) => {
    const userEdge = userERD.edges.find(
      (e) => e.from === expectedEdge.from && e.to === expectedEdge.to,
    );
    return userEdge && userEdge.type !== expectedEdge.type;
  });

  const correct =
    missingNodes.length === 0 &&
    extraNodes.length === 0 &&
    missingEdges.length === 0 &&
    extraEdges.length === 0 &&
    incorrectEdgeTypes.length === 0;

  return {
    correct,
    missingNodes,
    extraNodes,
    missingEdges,
    extraEdges,
    incorrectEdgeTypes,
  };
}
