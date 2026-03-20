"use client";

import { useState, useCallback } from "react";
import { TableSchema, Column } from "@/types";
import Button from "./Button";

interface SchemaBuilderProps {
  initialSchema?: TableSchema[];
  onSchemaChange: (schema: TableSchema[]) => void;
}

export default function SchemaBuilder({
  initialSchema = [],
  onSchemaChange,
}: SchemaBuilderProps) {
  const [tables, setTables] = useState<TableSchema[]>(initialSchema);
  const [editingTable, setEditingTable] = useState<string | null>(null);
  const [showNewTableForm, setShowNewTableForm] = useState(false);
  const [newTableName, setNewTableName] = useState("");

  const handleAddTable = () => {
    if (!newTableName.trim()) return;

    const newTable: TableSchema = {
      name: newTableName.toLowerCase(),
      columns: [
        {
          name: "id",
          type: "INT",
          isPrimary: true,
        },
      ],
    };

    const updated = [...tables, newTable];
    setTables(updated);
    onSchemaChange(updated);
    setNewTableName("");
    setShowNewTableForm(false);
  };

  const handleDeleteTable = (tableName: string) => {
    const updated = tables.filter((t) => t.name !== tableName);
    setTables(updated);
    onSchemaChange(updated);
  };

  const handleAddColumn = (tableName: string) => {
    const updated = tables.map((table) => {
      if (table.name === tableName) {
        return {
          ...table,
          columns: [
            ...table.columns,
            {
              name: `column_${table.columns.length}`,
              type: "VARCHAR" as const,
              isNullable: true,
            },
          ],
        };
      }
      return table;
    });
    setTables(updated);
    onSchemaChange(updated);
  };

  const handleUpdateColumn = (
    tableName: string,
    colIndex: number,
    updates: Partial<Column>,
  ) => {
    const updated = tables.map((table) => {
      if (table.name === tableName) {
        const newColumns = [...table.columns];
        newColumns[colIndex] = { ...newColumns[colIndex], ...updates };
        return { ...table, columns: newColumns };
      }
      return table;
    });
    setTables(updated);
    onSchemaChange(updated);
  };

  const handleDeleteColumn = (tableName: string, colIndex: number) => {
    const updated = tables.map((table) => {
      if (table.name === tableName) {
        return {
          ...table,
          columns: table.columns.filter((_, i) => i !== colIndex),
        };
      }
      return table;
    });
    setTables(updated);
    onSchemaChange(updated);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold mb-4">Schema Builder</h2>
        <Button
          onClick={() => setShowNewTableForm(true)}
          variant="primary"
          size="sm"
        >
          + Add Table
        </Button>
      </div>

      {/* New table form */}
      {showNewTableForm && (
        <div className="rounded-lg border border-gray-300 bg-blue-50 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              placeholder="Table name"
              className="flex-1 rounded border border-gray-300 px-3 py-2"
              onKeyPress={(e) => {
                if (e.key === "Enter") handleAddTable();
              }}
            />
            <Button onClick={handleAddTable} variant="primary" size="sm">
              Create
            </Button>
            <Button
              onClick={() => {
                setShowNewTableForm(false);
                setNewTableName("");
              }}
              variant="secondary"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Tables list */}
      <div className="space-y-3">
        {tables.map((table) => (
          <div
            key={table.name}
            className="rounded-lg border border-gray-200 bg-white"
          >
            {/* Table header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
              <h3 className="font-bold text-lg">{table.name}</h3>
              <Button
                onClick={() => handleDeleteTable(table.name)}
                variant="danger"
                size="sm"
              >
                Delete
              </Button>
            </div>

            {/* Columns */}
            <div className="p-4">
              <div className="space-y-3">
                {table.columns.map((col, idx) => (
                  <div
                    key={`${table.name}-${idx}`}
                    className="flex items-end gap-2 rounded border border-gray-200 bg-gray-50 p-3"
                  >
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Column Name
                      </label>
                      <input
                        type="text"
                        value={col.name}
                        onChange={(e) =>
                          handleUpdateColumn(table.name, idx, {
                            name: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Type
                      </label>
                      <select
                        value={col.type}
                        onChange={(e) =>
                          handleUpdateColumn(table.name, idx, {
                            type: e.target.value as Column["type"],
                          })
                        }
                        className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
                      >
                        <option>INT</option>
                        <option>VARCHAR</option>
                        <option>TEXT</option>
                        <option>DATE</option>
                        <option>FLOAT</option>
                        <option>BOOLEAN</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={col.isPrimary || false}
                          onChange={(e) =>
                            handleUpdateColumn(table.name, idx, {
                              isPrimary: e.target.checked,
                            })
                          }
                          className="h-4 w-4"
                        />
                        <span className="text-xs">PK</span>
                      </label>
                    </div>

                    <div className="space-y-1">
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={col.isForeign || false}
                          onChange={(e) =>
                            handleUpdateColumn(table.name, idx, {
                              isForeign: e.target.checked,
                            })
                          }
                          className="h-4 w-4"
                        />
                        <span className="text-xs">FK</span>
                      </label>
                    </div>

                    {col.isForeign && (
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-700">
                          References
                        </label>
                        <select
                          value={col.references?.table || ""}
                          onChange={(e) => {
                            handleUpdateColumn(table.name, idx, {
                              references: {
                                table: e.target.value,
                                column: "id",
                              },
                            });
                          }}
                          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
                        >
                          <option value="">Select table...</option>
                          {tables.map((t) => (
                            <option key={t.name} value={t.name}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <Button
                      onClick={() => handleDeleteColumn(table.name, idx)}
                      variant="danger"
                      size="sm"
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handleAddColumn(table.name)}
                variant="secondary"
                size="sm"
                className="mt-3 w-full"
              >
                + Add Column
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
