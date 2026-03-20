// Core game types

export interface Column {
  name: string;
  type: "INT" | "VARCHAR" | "TEXT" | "DATE" | "FLOAT" | "BOOLEAN";
  isPrimary?: boolean;
  isForeign?: boolean;
  references?: {
    table: string;
    column: string;
  };
  isNullable?: boolean;
}

export interface TableSchema {
  name: string;
  columns: Column[];
}

export interface ERDNode {
  id: string;
  label: string;
  columns?: string[];
}

export interface ERDEdge {
  from: string;
  to: string;
  type: "1:N" | "M:N" | "1:1";
  fromTable: string;
  toTable: string;
}

export interface ERD {
  nodes: ERDNode[];
  edges: ERDEdge[];
}

export interface Level {
  id: string;
  title: string;
  world: number;
  type: "query" | "schema";
  description: string;
  story: string;
  schema?: TableSchema[]; // Initial schema provided to user
  expectedQuery?: string; // For query levels
  expectedSchema?: TableSchema[]; // Expected schema for schema design levels
  expectedERD?: ERD;
  sampleData?: Array<{ table: string; values: Record<string, unknown> }>;
  requiredInserts?: Record<string, number>;
  hints: string[];
  xp: number;
}

export interface ComparisonResult {
  isCorrect: boolean;
  correctTables: string[];
  missingTables: string[];
  extraTables: string[];
  incorrectColumns: {
    table: string;
    issues: string[];
  }[];
  missingForeignKeys: {
    from: string;
    to: string;
  }[];
  extraForeignKeys: {
    from: string;
    to: string;
  }[];
  issues: string[];
  score: number; // 0-100
}

export interface QueryExecutionResult {
  success: boolean;
  data?: Array<Record<string, unknown>>;
  columns?: string[];
  error?: string;
  executionTime: number;
}

export interface UserProgress {
  userId: string;
  levelId: string;
  completed: boolean;
  xpEarned: number;
  attemptCount: number;
  schema?: TableSchema[];
  query?: string;
  completedAt?: Date;
  hints: number; // How many hints used
}
