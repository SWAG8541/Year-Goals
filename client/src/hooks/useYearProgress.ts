import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { CalendarDay, UserGoal } from '@shared/schema';

export interface DayStatus {
  date: string;
  completed: boolean;
  note?: string;
}

export function useYearProgress() {
  const queryClient = useQueryClient();

  // Fetch all calendar days
  const { data: calendarDays = [] } = useQuery<CalendarDay[]>({
    queryKey: ['/api/calendar-days'],
  });

  // Fetch user goal
  const { data: userGoalData } = useQuery<UserGoal>({
    queryKey: ['/api/user-goal'],
  });

  // Convert API data to Record format for easier lookup
  const completedDays: Record<string, DayStatus> = calendarDays.reduce((acc, day) => {
    acc[day.date] = {
      date: day.date,
      completed: day.completed,
      note: day.note || undefined,
    };
    return acc;
  }, {} as Record<string, DayStatus>);

  const mainGoal = userGoalData?.goal || "";

  // Toggle day mutation
  const toggleDayMutation = useMutation({
    mutationFn: async (date: string) => {
      const current = completedDays[date];
      if (current?.completed) {
        // Delete if currently completed
        return apiRequest('DELETE', `/api/calendar-days/${date}`);
      } else {
        // Create/update if not completed
        return apiRequest('POST', '/api/calendar-days', {
          date,
          completed: true,
          note: current?.note || null,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar-days'] });
    },
  });

  // Set note mutation
  const setNoteMutation = useMutation({
    mutationFn: async ({ date, note }: { date: string; note: string }) => {
      return apiRequest('POST', '/api/calendar-days', {
        date,
        completed: completedDays[date]?.completed ?? false,
        note,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar-days'] });
    },
  });

  // Set main goal mutation
  const setMainGoalMutation = useMutation({
    mutationFn: async (goal: string) => {
      return apiRequest('POST', '/api/user-goal', { goal });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-goal'] });
    },
  });

  return {
    completedDays,
    mainGoal,
    toggleDay: (date: string) => toggleDayMutation.mutate(date),
    setNote: (date: string, note: string) => setNoteMutation.mutate({ date, note }),
    setMainGoal: (goal: string) => setMainGoalMutation.mutate(goal),
  };
}
