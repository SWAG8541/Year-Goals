import React, { useState } from 'react';
import { eachDayOfInterval, format, isToday } from 'date-fns';
import { useYearProgress } from '@/hooks/useYearProgress';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export function YearGrid() {
  const { completedDays, toggleDay, setNote, mainGoal, setMainGoal } = useYearProgress();
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState("");

  const start = new Date(2026, 0, 1);
  const end = new Date(2026, 11, 31);
  const days = eachDayOfInterval({ start, end });

  const handleDayClick = (dateKey: string) => {
    // Simple toggle on left click
    toggleDay(dateKey);
  };

  const handleRightClick = (e: React.MouseEvent, dateKey: string) => {
    e.preventDefault();
    setEditingDate(dateKey);
    setTempNote(completedDays[dateKey]?.note || "");
  };

  const saveNote = () => {
    if (editingDate) {
      setNote(editingDate, tempNote);
      setEditingDate(null);
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto p-4 font-mono select-none">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">2026</h1>
        <input
          type="text"
          value={mainGoal}
          onChange={(e) => setMainGoal(e.target.value)}
          placeholder="MY GOAL FOR 2026..."
          className="w-full max-w-lg text-center bg-transparent border-b border-dashed border-primary/40 py-1 text-lg focus:outline-none focus:border-primary uppercase tracking-widest placeholder:text-muted-foreground/40"
        />
      </header>

      <div className="flex justify-center">
        <div className="grid grid-cols-12 sm:grid-cols-18 md:grid-cols-24 lg:grid-cols-[repeat(31,minmax(0,1fr))] gap-1">
          {days.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const status = completedDays[dateKey];
            const isCompleted = status?.completed;
            const isTodayDate = isToday(day);
            const dayNumber = format(day, 'd');
            const hasNote = !!status?.note;

            return (
              <div
                key={dateKey}
                onClick={() => handleDayClick(dateKey)}
                onContextMenu={(e) => handleRightClick(e, dateKey)}
                className={cn(
                  "aspect-square relative flex items-center justify-center border border-primary/30 text-[10px] sm:text-xs cursor-pointer hover:bg-primary/5 transition-colors bg-white/50",
                  isTodayDate && "ring-1 ring-primary ring-inset",
                  hasNote && !isCompleted && "bg-yellow-50"
                )}
                title={format(day, 'MMM d, yyyy')}
              >
                {/* Date Placeholder */}
                <span className={cn(
                  "opacity-40",
                  isCompleted && "opacity-20"
                )}>
                  {dayNumber}
                </span>

                {/* Diagonal Line for Completed */}
                {isCompleted && (
                  <svg 
                    className="absolute inset-0 w-full h-full text-primary pointer-events-none" 
                    viewBox="0 0 100 100" 
                    preserveAspectRatio="none"
                  >
                    <line 
                      x1="0" 
                      y1="100" 
                      x2="100" 
                      y2="0" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                    />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={!!editingDate} onOpenChange={(open) => !open && setEditingDate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Note for {editingDate && format(new Date(editingDate), 'MMM d, yyyy')}</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="note" className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Goal / Note</Label>
            <Textarea
              id="note"
              value={tempNote}
              onChange={(e) => setTempNote(e.target.value)}
              placeholder="Record your progress..."
              className="font-mono"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDate(null)}>Close</Button>
            <Button onClick={saveNote}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p>Left click to mark complete • Right click to add note</p>
      </div>
    </div>
  );
}
