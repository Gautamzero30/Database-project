"use client";

import { useState } from "react";
import Button from "./Button";

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onExecute: () => void;
  isLoading?: boolean;
}

export default function SqlEditor({
  value,
  onChange,
  onExecute,
  isLoading = false,
}: SqlEditorProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-semibold text-slate-800">SQL Query</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-64 w-full rounded-xl border border-slate-300 bg-slate-950 p-4 font-mono text-sm text-cyan-100 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none"
        placeholder="SELECT * FROM student;"
      />
      <Button
        onClick={onExecute}
        disabled={isLoading || !value.trim()}
        className="w-full bg-cyan-600 hover:bg-cyan-700"
      >
        {isLoading ? "Executing..." : "Execute Query"}
      </Button>
    </div>
  );
}
