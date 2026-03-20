import { useEffect, useState, useCallback } from "react";
import { UserProgress, TableSchema } from "@/types";

export function useProgress(userId?: string) {
  const [progress, setProgress] = useState<Map<string, UserProgress>>(
    new Map(),
  );
  const [totalXP, setTotalXP] = useState(0);

  useEffect(() => {
    if (!userId) {
      return;
    }

    fetch("/api/progress")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load progress");
        }
        return res.json();
      })
      .then((data) => {
        const progressMap = new Map<string, UserProgress>(
          Object.entries(data.progress || {}) as Array<[string, UserProgress]>,
        );
        setProgress(progressMap);
        setTotalXP(data.totalXP || 0);
      })
      .catch((error) => {
        console.error("Failed to load progress:", error);
      });
  }, [userId]);

  const saveProgress = useCallback(
    async (
      levelId: string,
      completed: boolean,
      xpEarned: number = 0,
      schema?: TableSchema[],
      query?: string,
      hintsUsed: number = 0,
    ) => {
      if (!userId) return;

      const userProgress: UserProgress = {
        userId,
        levelId,
        completed,
        xpEarned,
        attemptCount: (progress.get(levelId)?.attemptCount || 0) + 1,
        schema,
        query,
        hints: hintsUsed,
        completedAt: completed ? new Date() : undefined,
      };

      // Update local state
      const updated = new Map(progress);
      updated.set(levelId, userProgress);
      setProgress(updated);

      let nextXP = 0;
      updated.forEach((entry) => {
        if (entry.completed) {
          nextXP += entry.xpEarned || 0;
        }
      });
      setTotalXP(nextXP);

      // Save to API
      try {
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            levelId,
            completed,
            xpEarned,
            schema,
            query,
            hintsUsed,
          }),
        });
      } catch (error) {
        console.error("Failed to save progress to server:", error);
      }
    },
    [userId, progress],
  );

  const isLevelComplete = useCallback(
    (levelId: string) => {
      return progress.get(levelId)?.completed || false;
    },
    [progress],
  );

  const getLevelProgress = useCallback(
    (levelId: string) => {
      return progress.get(levelId) || null;
    },
    [progress],
  );

  return {
    progress,
    totalXP,
    saveProgress,
    isLevelComplete,
    getLevelProgress,
  };
}
