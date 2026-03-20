"use client";

import { Level } from "@/types";
import LevelCard from "./LevelCard";

interface WorldMapProps {
  levels: Record<number, Level[]>;
  completedLevelIds?: Set<string>;
}

export default function WorldMap({
  levels,
  completedLevelIds = new Set(),
}: WorldMapProps) {
  const worldTitles: Record<number, string> = {
    1: "🎓 College Task",
    2: "🛒 Ecommerce Task",
    3: "🍽️ Restaurant Task",
  };

  const sortedWorlds = Object.keys(levels)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="space-y-8">
      {sortedWorlds.map((worldNumber) => {
        const worldLevels = levels[worldNumber] || [];

        const previousWorld =
          sortedWorlds[sortedWorlds.indexOf(worldNumber) - 1];
        const previousWorldLevels = previousWorld
          ? levels[previousWorld] || []
          : [];
        const previousWorldLastLevelId =
          previousWorldLevels.length > 0
            ? previousWorldLevels[previousWorldLevels.length - 1].id
            : null;

        if (
          worldNumber !== sortedWorlds[0] &&
          previousWorldLastLevelId &&
          !completedLevelIds.has(previousWorldLastLevelId)
        ) {
          return null;
        }

        return (
          <div key={worldNumber}>
            <h2 className="mb-4 text-2xl font-bold text-slate-900">
              {worldTitles[worldNumber] || `World ${worldNumber}`}
            </h2>
            <div className="space-y-3">
              {worldLevels.map((level, idx) => {
                const isFirstLevel = idx === 0;
                const previousLevelCompleted =
                  idx === 0 || completedLevelIds.has(worldLevels[idx - 1].id);
                const isUnlocked = isFirstLevel || previousLevelCompleted;

                return (
                  <LevelCard
                    key={level.id}
                    level={level}
                    isUnlocked={isUnlocked}
                    isCompleted={completedLevelIds.has(level.id)}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
