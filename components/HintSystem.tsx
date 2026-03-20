"use client";

import { useState } from "react";

interface HintSystemProps {
  hints: string[];
  onShowHint: (index: number) => void;
}

export default function HintSystem({ hints, onShowHint }: HintSystemProps) {
  const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set());
  const [highestUnlocked, setHighestUnlocked] = useState(0);

  const handleShowHint = (index: number) => {
    setRevealedHints((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });

    if (index >= highestUnlocked) {
      setHighestUnlocked(Math.min(index + 1, hints.length - 1));
      onShowHint(index);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="space-y-1.5">
        {hints.map((hint, index) => (
          <div
            key={index}
            className="rounded-lg border border-gray-200 bg-white"
          >
            <button
              onClick={() => handleShowHint(index)}
              className="w-full px-3 py-2.5 text-left text-slate-800 hover:bg-gray-50 disabled:text-slate-400"
              disabled={index > highestUnlocked}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800">
                  Hint {index + 1}
                  {revealedHints.has(index) && " ✓"}
                </span>
                <span className="text-xs text-slate-500">
                  {revealedHints.has(index) ? "▼" : "▶"}
                </span>
              </div>
            </button>
            {revealedHints.has(index) && (
              <div className="border-t border-gray-200 bg-blue-50 px-3 py-2.5">
                <p className="text-xs leading-relaxed text-gray-800">{hint}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
