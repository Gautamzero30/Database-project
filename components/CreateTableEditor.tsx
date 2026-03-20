"use client";

import { useState } from "react";
import Button from "./Button";

interface CreateTableEditorProps {
  value: string;
  onChange: (value: string) => void;
  onExecute: () => void;
  isLoading?: boolean;
}

export default function CreateTableEditor({
  value,
  onChange,
  onExecute,
  isLoading = false,
}: CreateTableEditorProps) {
  const [showTemplate, setShowTemplate] = useState(false);

  const insertTemplate = () => {
    const template = `CREATE TABLE table_name (
    id INT PRIMARY KEY AUTO_INCREMENT,
    column_name VARCHAR(255),
    created_at DATE
);`;
    onChange(value + (value ? "\n\n" : "") + template);
    setShowTemplate(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="font-semibold">CREATE TABLE Statements</label>
        <button
          onClick={() => setShowTemplate(!showTemplate)}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          {showTemplate ? "Hide" : "Show"} Template
        </button>
      </div>

      {showTemplate && (
        <div className="text-xs bg-blue-50 border border-blue-200 rounded p-3 flex items-center justify-between">
          <code className="text-blue-900">
            CREATE TABLE name (id INT PRIMARY KEY, ...)
          </code>
          <button
            onClick={insertTemplate}
            className="ml-2 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
          >
            Insert
          </button>
        </div>
      )}

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-64 w-full rounded border border-gray-300 p-3 font-mono text-sm focus:border-blue-500 focus:outline-none"
        placeholder={`CREATE TABLE student (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    email VARCHAR(255),
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES department(id)
);`}
      />

      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
        <p>💡 Tip: Write multiple CREATE TABLE statements. Don't forget:</p>
        <ul className="list-disc list-inside mt-1">
          <li>Primary keys (PRIMARY KEY)</li>
          <li>Foreign keys (FOREIGN KEY ... REFERENCES)</li>
          <li>Column types (INT, VARCHAR, DATE, etc.)</li>
        </ul>
      </div>

      <Button
        onClick={onExecute}
        disabled={isLoading || !value.trim()}
        className="w-full"
      >
        {isLoading ? "Creating..." : "Create Tables"}
      </Button>
    </div>
  );
}
