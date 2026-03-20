"use client";

import { TableSchema } from "@/types";

interface TargetERDDisplayProps {
  tables: TableSchema[];
  title?: string;
}

export default function TargetERDDisplay({
  tables,
  title = "Target Database Structure",
}: TargetERDDisplayProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
      <h3 className="font-bold text-lg">{title}</h3>

      <div className="space-y-3 font-mono text-sm">
        {tables.map((table) => (
          <div
            key={table.name}
            className="border-l-4 border-blue-600 bg-blue-50 p-3 rounded"
          >
            <div className="font-bold text-blue-900 uppercase mb-2">
              {table.name}
            </div>
            <div className="space-y-1 ml-2">
              {table.columns.map((col) => (
                <div key={col.name} className="text-xs text-gray-700">
                  <span className="text-blue-600 font-semibold">
                    {col.name}
                  </span>
                  <span className="text-gray-500 ml-2">{col.type}</span>
                  {col.isPrimary && (
                    <span className="ml-2 bg-yellow-200 text-yellow-900 px-2 py-0.5 rounded text-xs font-bold">
                      PK
                    </span>
                  )}
                  {col.isForeign && col.references && (
                    <span className="ml-2 bg-green-200 text-green-900 px-2 py-0.5 rounded text-xs font-bold">
                      FK → {col.references.table}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Relationships Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="font-semibold mb-2 text-sm">Relationships:</h4>
        <div className="space-y-1 text-xs text-gray-700">
          {tables.map((table) =>
            table.columns
              .filter((col) => col.isForeign && col.references)
              .map((col) => (
                <div key={`${table.name}-${col.name}`}>
                  <span className="font-mono">
                    {table.name}.{col.name}
                  </span>
                  <span className="text-gray-500 mx-1">→</span>
                  <span className="font-mono">
                    {col.references?.table}.{col.references?.column}
                  </span>
                </div>
              )),
          )}
        </div>
      </div>
    </div>
  );
}
