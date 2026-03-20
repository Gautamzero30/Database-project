"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { TableSchema, ERD } from "@/types";
import { generateERDFromSchema } from "@/lib/erd";

const ReactFlow = dynamic(
  async () => {
    const { ReactFlow, Background, Controls, useEdgesState, useNodesState } =
      await import("reactflow");
    return (props: any) => {
      const [nodes] = useNodesState([]);
      const [edges] = useEdgesState([]);
      return (
        <div style={{ height: "100%", width: "100%" }}>
          <ReactFlow nodes={nodes} edges={edges}>
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      );
    };
  },
  { ssr: false, loading: () => <div className="p-4">Loading diagram...</div> },
);

interface ERDiagramProps {
  tables: TableSchema[];
  expectedTables?: TableSchema[];
}

export default function ERDiagram({ tables, expectedTables }: ERDiagramProps) {
  const erd = useMemo(() => generateERDFromSchema(tables), [tables]);
  const expectedERD = useMemo(
    () => (expectedTables ? generateERDFromSchema(expectedTables) : null),
    [expectedTables],
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-bold mb-2">Your Schema (ERD)</h3>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <ERDVisual erd={erd} />
        </div>
      </div>

      {expectedERD && (
        <div>
          <h3 className="font-bold mb-2">Expected Schema (ERD)</h3>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <ERDVisual erd={expectedERD} />
          </div>
        </div>
      )}
    </div>
  );
}

function ERDVisual({ erd }: { erd: ERD }) {
  if (erd.nodes.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <p>No tables yet. Add tables to see the diagram.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Simple text-based diagram */}
      <div className="font-mono text-sm bg-gray-50 p-3 rounded overflow-x-auto">
        {erd.nodes.map((node) => (
          <div key={node.id} className="mb-2">
            <span className="font-bold text-blue-600">[{node.label}]</span>
          </div>
        ))}
      </div>

      {/* Relationships */}
      {erd.edges.length > 0 && (
        <div>
          <p className="font-semibold mb-2">Relationships:</p>
          <ul className="space-y-1 text-sm">
            {erd.edges.map((edge, idx) => (
              <li key={idx} className="text-gray-700">
                {edge.from}
                <span className="text-red-600 mx-1">
                  {edge.type === "1:N" ? "─→" : "←→"}
                </span>
                {edge.to}
                <span className="text-xs text-gray-500 ml-2">
                  ({edge.type})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
