"use client";

import { QueryExecutionResult } from "@/types";

interface ResultTableProps {
  result: QueryExecutionResult;
}

export default function ResultTable({ result }: ResultTableProps) {
  if (!result.success) {
    return (
      <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
        <p className="font-bold text-red-800">Error</p>
        <p className="text-sm text-red-700">{result.error}</p>
        <p className="mt-2 text-xs text-gray-600">
          Execution time: {result.executionTime}ms
        </p>
      </div>
    );
  }

  if (!result.data || result.data.length === 0) {
    return (
      <div className="rounded-lg border-2 border-blue-300 bg-blue-50 p-4">
        <p className="font-bold text-blue-800">No results</p>
        <p className="text-xs text-gray-600">
          Execution time: {result.executionTime}ms
        </p>
      </div>
    );
  }

  const columns = result.columns || Object.keys(result.data[0]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white text-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="border-b border-gray-200 px-4 py-2 text-left font-semibold text-slate-800"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.data.slice(0, 100).map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                {columns.map((col) => (
                  <td
                    key={`${idx}-${col}`}
                    className="px-4 py-2 text-sm text-slate-900"
                  >
                    {String(row[col] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-600">
        Showing {Math.min(100, result.data.length)} of {result.data.length} rows
        • Execution time: {result.executionTime}ms
      </div>
    </div>
  );
}
