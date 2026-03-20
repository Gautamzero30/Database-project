"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Level, TableSchema, ComparisonResult } from "@/types";
import SchemaBuilder from "@/components/SchemaBuilder";
import ERDiagram from "@/components/ERDiagram";
import HintSystem from "@/components/HintSystem";
import Button from "@/components/Button";

export default function SchemaDesignPage() {
  const params = useParams();
  const router = useRouter();
  const levelId = params?.id as string;

  const [level, setLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState(true);
  const [userSchema, setUserSchema] = useState<TableSchema[]>([]);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [comparing, setComparing] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  useEffect(() => {
    if (!levelId) return;

    fetch(`/api/levels?id=${levelId}`)
      .then((res) => res.json())
      .then((data) => {
        setLevel(data);
        setUserSchema(data.expectedSchema ? [] : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load level:", err);
        setLoading(false);
      });
  }, [levelId]);

  const handleCompare = async () => {
    if (!level || !level.expectedSchema) return;

    setComparing(true);
    try {
      const response = await fetch("/api/schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userSchema,
          expectedSchema: level.expectedSchema,
        }),
      });

      const data = await response.json();
      if (data.schemaComparison) {
        setComparison(data.schemaComparison);
      }
    } catch (error) {
      console.error("Comparison failed:", error);
    } finally {
      setComparing(false);
    }
  };

  const handleShowHint = (index: number) => {
    setHintsUsed(index + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading level...</p>
      </div>
    );
  }

  if (!level) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Level not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <Button onClick={() => router.back()} variant="secondary" size="sm">
              ← Back
            </Button>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">{level.title}</h1>
            <p className="text-gray-600">{level.description}</p>
          </div>
          <div className="text-right">
            <span className="inline-block rounded bg-yellow-100 px-3 py-1 font-semibold text-yellow-800">
              {level.xp} XP
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Left: Story & Hints */}
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="mb-2 font-bold">Story</h3>
              <p className="text-sm text-gray-700">{level.story}</p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <HintSystem hints={level.hints} onShowHint={handleShowHint} />
              {hintsUsed > 0 && (
                <p className="mt-2 text-xs text-gray-500">
                  Hints used: {hintsUsed}
                </p>
              )}
            </div>
          </div>

          {/* Center: Schema Builder */}
          <div className="space-y-4 lg:col-span-1">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <SchemaBuilder
                initialSchema={userSchema}
                onSchemaChange={setUserSchema}
              />

              <Button
                onClick={handleCompare}
                disabled={comparing || userSchema.length === 0}
                className="mt-4 w-full"
              >
                {comparing ? "Comparing..." : "Check Schema"}
              </Button>
            </div>

            {/* Comparison Results */}
            {comparison && (
              <div
                className={`rounded-lg border-2 p-4 ${
                  comparison.isCorrect
                    ? "border-green-400 bg-green-50"
                    : "border-yellow-400 bg-yellow-50"
                }`}
              >
                <h3 className="font-bold mb-2">
                  {comparison.isCorrect ? "✓ Correct!" : "Schema Comparison"}
                </h3>

                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Score:</strong>
                    <span className="ml-2 font-bold text-lg">
                      {comparison.score}/100
                    </span>
                  </p>

                  {comparison.missingTables.length > 0 && (
                    <div className="text-red-700">
                      <p className="font-semibold">Missing tables:</p>
                      <p>{comparison.missingTables.join(", ")}</p>
                    </div>
                  )}

                  {comparison.extraTables.length > 0 && (
                    <div className="text-orange-700">
                      <p className="font-semibold">Extra tables:</p>
                      <p>{comparison.extraTables.join(", ")}</p>
                    </div>
                  )}

                  {comparison.issues.length > 0 && (
                    <div className="text-red-700">
                      <p className="font-semibold">Issues:</p>
                      <ul className="list-inside list-disc">
                        {comparison.issues.map((issue, idx) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: ER Diagrams */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <ERDiagram
              tables={userSchema}
              expectedTables={level.expectedSchema}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
