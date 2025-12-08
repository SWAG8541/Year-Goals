import { useState, useEffect } from 'react';

const STORAGE_KEY = 'year_tracker_2026';

export interface DayStatus {
  date: string; // ISO date string YYYY-MM-DD
  completed: boolean;
  note?: string;
}

export function useYearProgress() {
  const [completedDays, setCompletedDays] = useState<Record<string, DayStatus>>({});
  const [mainGoal, setMainGoal] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCompletedDays(parsed.completedDays || {});
        setMainGoal(parsed.mainGoal || "");
      } catch (e) {
        console.error("Failed to load progress", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ completedDays, mainGoal }));
  }, [completedDays, mainGoal]);

  const toggleDay = (date: string) => {
    setCompletedDays(prev => {
      const current = prev[date];
      if (current?.completed) {
        const { [date]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [date]: { date, completed: true, note: current?.note }
      };
    });
  };

  const setNote = (date: string, note: string) => {
    setCompletedDays(prev => ({
      ...prev,
      [date]: { ...prev[date], date, note, completed: prev[date]?.completed ?? false }
    }));
  };

  return { completedDays, toggleDay, setNote, mainGoal, setMainGoal };
}
