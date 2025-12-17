import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useReminder(goal: string, todayNote?: string) {
  const { toast } = useToast();

  useEffect(() => {
    if (!goal) return;

    const showReminder = () => {
      const description = todayNote 
        ? `${goal}\n\nToday's note: "${todayNote}"`
        : goal;
      
      toast({
        title: "🎯 Goal Reminder",
        description,
        duration: 10000,
      });
    };

    // Show initial reminder after 5 seconds
    const timeout = setTimeout(showReminder, 5000);

    // Show reminder every 3 hours
    const interval = setInterval(showReminder, 3 * 60 * 60 * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [goal, todayNote, toast]);
}
