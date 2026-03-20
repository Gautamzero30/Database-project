"use client";

import { Level } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Button from "./Button";

interface LevelCardProps {
  level: Level;
  isUnlocked: boolean;
  isCompleted?: boolean;
}

export default function LevelCard({
  level,
  isUnlocked,
  isCompleted,
}: LevelCardProps) {
  const router = useRouter();
  const levelRoute = `/level/${level.id}`;

  useEffect(() => {
    if (isUnlocked) {
      router.prefetch(levelRoute);
    }
  }, [isUnlocked, levelRoute, router]);

  const handlePlay = () => {
    router.push(levelRoute);
  };

  return (
    <div
      onMouseEnter={() => {
        if (isUnlocked) {
          router.prefetch(levelRoute);
        }
      }}
      className={`rounded-lg border-2 p-4 transition-all ${
        isUnlocked
          ? "border-blue-400 bg-white hover:shadow-lg"
          : "border-gray-300 bg-gray-100 opacity-50"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-slate-900">{level.title}</h3>
          <p className="text-sm text-gray-600">{level.description}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-800">
              World {level.world}
            </span>
            <span className="rounded bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
              {level.xp} XP
            </span>
            {level.type === "schema" && (
              <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                Schema Design
              </span>
            )}
          </div>
        </div>
        <div className="ml-4 text-right">
          {isCompleted && (
            <div className="mb-2 text-center">
              <span className="text-2xl">⭐</span>
            </div>
          )}
          <Button
            onClick={handlePlay}
            disabled={!isUnlocked}
            variant={isUnlocked ? "primary" : "secondary"}
          >
            {isCompleted ? "Replay" : "Play"}
          </Button>
        </div>
      </div>
    </div>
  );
}
