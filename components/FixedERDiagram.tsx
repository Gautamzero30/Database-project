"use client";

import { TableSchema } from "@/types";

type Position = { x: number; y: number };

interface FixedERDiagramProps {
  tables: TableSchema[];
}

function buildPositions(count: number): Position[] {
  if (count <= 1) {
    return [{ x: 280, y: 120 }];
  }

  const centerX = 280;
  const centerY = 140;
  const radius = 95;
  return Array.from({ length: count }).map((_, idx) => {
    const angle = (Math.PI * 2 * idx) / count;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });
}

export default function FixedERDiagram({ tables }: FixedERDiagramProps) {
  const positions = buildPositions(tables.length);

  const edges = tables.flatMap(
    (table, toIdx) =>
      table.columns
        .filter((col) => col.isForeign && col.references)
        .map((col) => {
          const fromIdx = tables.findIndex(
            (t) => t.name === col.references?.table,
          );
          if (fromIdx < 0) {
            return null;
          }

          return {
            key: `${table.name}-${col.name}`,
            from: positions[fromIdx],
            to: positions[toIdx],
          };
        })
        .filter(Boolean) as Array<{
        key: string;
        from: Position;
        to: Position;
      }>,
  );

  return (
    <div className="rounded-xl border border-blue-200 bg-linear-to-br from-blue-50 to-cyan-50 p-4">
      <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-900">
        Expected ER Diagram
      </h4>
      <div className="relative h-70 overflow-hidden rounded-lg border border-blue-200 bg-white">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 560 280">
          {edges.map((edge) => (
            <line
              key={edge.key}
              x1={edge.from.x}
              y1={edge.from.y}
              x2={edge.to.x}
              y2={edge.to.y}
              stroke="#0e7490"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
          ))}

          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#0e7490" />
            </marker>
          </defs>
        </svg>

        {tables.map((table, idx) => (
          <div
            key={table.name}
            className="absolute min-w-24 rounded border border-blue-300 bg-blue-900 px-3 py-2 text-center text-xs font-semibold uppercase text-white shadow"
            style={{
              left: `${positions[idx].x - 42}px`,
              top: `${positions[idx].y - 16}px`,
            }}
          >
            {table.name}
          </div>
        ))}
      </div>
    </div>
  );
}
