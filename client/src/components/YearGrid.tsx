import React, { useState } from 'react';
import { eachDayOfInterval, format, isToday, getDayOfYear, getMonth } from 'date-fns';
import { useYearProgress } from '@/hooks/useYearProgress';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

// Indian Festivals 2026 (Approximate/Major dates)
const INDIAN_FESTIVALS_2026: Record<string, string> = {
  '2026-01-14': 'Makar Sankranti / Pongal',
  '2026-01-26': 'Republic Day',
  '2026-02-16': 'Mahashivratri',
  '2026-03-04': 'Holi',
  '2026-03-20': 'Ramadan Start (Approx)',
  '2026-03-27': 'Ram Navami',
  '2026-04-02': 'Mahavir Jayanti',
  '2026-04-14': 'Baisakhi / Ambedkar Jayanti',
  '2026-05-23': 'Buddha Purnima',
  '2026-08-15': 'Independence Day',
  '2026-08-27': 'Raksha Bandhan',
  '2026-09-04': 'Janmashtami',
  '2026-09-15': 'Ganesh Chaturthi',
  '2026-10-02': 'Gandhi Jayanti',
  '2026-10-20': 'Dussehra',
  '2026-11-08': 'Diwali',
  '2026-11-25': 'Guru Nanak Jayanti',
  '2026-12-25': 'Christmas',
};

// Pastel/Light colors for 12 months
const MONTH_COLORS = [
  'bg-red-100/80 border-red-200 text-red-900',       // Jan
  'bg-orange-100/80 border-orange-200 text-orange-900', // Feb
  'bg-amber-100/80 border-amber-200 text-amber-900',   // Mar
  'bg-yellow-100/80 border-yellow-200 text-yellow-900', // Apr
  'bg-lime-100/80 border-lime-200 text-lime-900',     // May
  'bg-green-100/80 border-green-200 text-green-900',   // Jun
  'bg-emerald-100/80 border-emerald-200 text-emerald-900', // Jul
  'bg-teal-100/80 border-teal-200 text-teal-900',     // Aug
  'bg-cyan-100/80 border-cyan-200 text-cyan-900',     // Sep
  'bg-sky-100/80 border-sky-200 text-sky-900',       // Oct
  'bg-blue-100/80 border-blue-200 text-blue-900',     // Nov
  'bg-indigo-100/80 border-indigo-200 text-indigo-900', // Dec
];

export function YearGrid() {
  const { completedDays, toggleDay, setNote, mainGoal, setMainGoal } = useYearProgress();
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState("");

  const start = new Date(2026, 0, 1);
  const end = new Date(2026, 11, 31);
  const days = eachDayOfInterval({ start, end });

  const handleDayClick = (dateKey: string) => {
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
    <div className="w-full max-w-[1400px] mx-auto p-4 font-mono select-none">
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
        {/* Adjusted grid columns to fit 365 nicely. 
            Common layouts: 
            - 1 column (list)
            - 7 columns (calendar weeks)
            - ~20-30 columns for "Year in Pixels" look. 
            Let's try to fit it nicely on screen. 
        */}
        <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-20 lg:grid-cols-[repeat(25,minmax(0,1fr))] xl:grid-cols-[repeat(30,minmax(0,1fr))] gap-1.5">
          {days.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const status = completedDays[dateKey];
            const isCompleted = status?.completed;
            const isTodayDate = isToday(day);
            const dayOfYear = getDayOfYear(day);
            const monthIndex = getMonth(day);
            const monthColorClass = MONTH_COLORS[monthIndex];
            const festival = INDIAN_FESTIVALS_2026[dateKey];
            const hasNote = !!status?.note;

            return (
              <TooltipProvider key={dateKey} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      onClick={() => handleDayClick(dateKey)}
                      onContextMenu={(e) => handleRightClick(e, dateKey)}
                      className={cn(
                        "aspect-square relative flex items-center justify-center text-[10px] sm:text-xs cursor-pointer hover:brightness-95 transition-all border",
                        monthColorClass, // Apply month-specific background color
                        isTodayDate && "ring-2 ring-black/50 ring-offset-1 z-10",
                        hasNote && !isCompleted && "ring-1 ring-inset ring-black/10"
                      )}
                    >
                      {/* Day of Year (1-365) */}
                      <span className={cn(
                        "font-medium opacity-60",
                        isCompleted && "opacity-30"
                      )}>
                        {dayOfYear}
                      </span>

                      {/* Diagonal Line for Completed */}
                      {isCompleted && (
                        <svg 
                          className="absolute inset-0 w-full h-full text-black/60 pointer-events-none" 
                          viewBox="0 0 100 100" 
                          preserveAspectRatio="none"
                        >
                          <line 
                            x1="0" 
                            y1="100" 
                            x2="100" 
                            y2="0" 
                            stroke="currentColor" 
                            strokeWidth="2.5" 
                          />
                        </svg>
                      )}
                      
                      {/* Festival Dot Indicator (Subtle) */}
                      {festival && (
                        <div className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-red-500/70" />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="text-center p-3 bg-white/95 backdrop-blur border shadow-xl">
                    <p className="font-bold text-sm">{format(day, 'MMMM do, yyyy')}</p>
                    <p className="text-xs text-muted-foreground">{format(day, 'EEEE')}</p>
                    <p className="text-xs mt-1 text-primary/80 font-mono">Day {dayOfYear} of {days.length}</p>
                    
                    {festival && (
                      <div className="mt-2 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">
                        🎉 {festival}
                      </div>
                    )}
                    
                    {status?.note && (
                      <div className="mt-2 pt-2 border-t text-xs italic">
                        "{status.note}"
                      </div>
                    )}
                    
                    <div className="mt-2 text-[10px] text-muted-foreground/60 border-t pt-1">
                      Right-click to edit note
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>

      <Dialog open={!!editingDate} onOpenChange={(open) => !open && setEditingDate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDate && (
                <div className="flex flex-col gap-1">
                  <span>{format(new Date(editingDate), 'MMMM do, yyyy')}</span>
                  {INDIAN_FESTIVALS_2026[editingDate] && (
                    <span className="text-sm font-normal text-amber-600">
                      🎉 {INDIAN_FESTIVALS_2026[editingDate]}
                    </span>
                  )}
                </div>
              )}
            </DialogTitle>
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
      
      <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-200"></div> Jan
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-100 border border-orange-200"></div> Feb
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-100 border border-amber-200"></div> Mar
        </div>
         <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-200"></div> Apr
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-lime-100 border border-lime-200"></div> May
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-200"></div> Jun
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-100 border border-emerald-200"></div> Jul
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-teal-100 border border-teal-200"></div> Aug
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-cyan-100 border border-cyan-200"></div> Sep
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-sky-100 border border-sky-200"></div> Oct
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 border border-blue-200"></div> Nov
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-indigo-100 border border-indigo-200"></div> Dec
        </div>
      </div>
    </div>
  );
}
