"use client";

import { TableSchema } from "@/types";

interface TablePreviewProps {
  tables: TableSchema[];
}

export default function TablePreview({ tables }: TablePreviewProps) {
  return (
    <div className="space-y-2.5">
      <h3 className="text-sm font-bold text-slate-800">Database Schema</h3>
      {tables.map((table) => (
        <div
          key={table.name}
          className="rounded-lg border border-gray-200 bg-white"
        >
          <div className="border-b border-gray-200 bg-gray-50 px-3 py-2">
            <h4 className="text-sm font-semibold text-slate-900">
              {table.name}
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border-b border-r border-gray-200 px-2 py-1.5 text-left text-slate-700">
                    Column
                  </th>
                  <th className="border-b border-r border-gray-200 px-2 py-1.5 text-left text-slate-700">
                    Type
                  </th>
                  <th className="border-b px-2 py-1.5 text-left text-slate-700">
                    Constraints
                  </th>
                </tr>
              </thead>
              <tbody>
                {table.columns.map((col) => (
                  <tr
                    key={`${table.name}-${col.name}`}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="border-r border-gray-200 px-2 py-1.5 font-mono font-semibold text-slate-900">
                      {col.name}
                    </td>
                    <td className="border-r border-gray-200 px-2 py-1.5 font-mono text-gray-600">
                      {col.type}
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="flex flex-wrap gap-1">
                        {col.isPrimary && (
                          <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-[10px] font-semibold text-yellow-800">
                            PK
                          </span>
                        )}
                        {col.isForeign && (
                          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-800">
                            FK → {col.references?.table}.
                            {col.references?.column}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
