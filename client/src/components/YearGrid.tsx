import React, { useState } from 'react';
import { eachDayOfInterval, format, isToday, getDayOfYear, getMonth, isBefore, startOfDay } from 'date-fns';
import { useYearProgress } from '@/hooks/useYearProgress';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Target, TrendingUp, Calendar } from 'lucide-react';
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

const MONTH_COLORS = [
  'bg-red-100/80 border-red-200 text-red-900',
  'bg-orange-100/80 border-orange-200 text-orange-900',
  'bg-amber-100/80 border-amber-200 text-amber-900',
  'bg-yellow-100/80 border-yellow-200 text-yellow-900',
  'bg-lime-100/80 border-lime-200 text-lime-900',
  'bg-green-100/80 border-green-200 text-green-900',
  'bg-emerald-100/80 border-emerald-200 text-emerald-900',
  'bg-teal-100/80 border-teal-200 text-teal-900',
  'bg-cyan-100/80 border-cyan-200 text-cyan-900',
  'bg-sky-100/80 border-sky-200 text-sky-900',
  'bg-blue-100/80 border-blue-200 text-blue-900',
  'bg-indigo-100/80 border-indigo-200 text-indigo-900',
];

export function YearGrid() {
  const { completedDays, toggleDay, setNote, mainGoal, setMainGoal } = useYearProgress();
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState("");
  const [editingGoal, setEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState("");
  const { toast } = useToast();

  const start = new Date(2026, 0, 1);
  const end = new Date(2026, 11, 31);
  const days = eachDayOfInterval({ start, end });

  const today = startOfDay(new Date());
  const completedCount = Object.values(completedDays).filter(d => d.completed).length;
  const progressPercent = ((completedCount / days.length) * 100).toFixed(1);

  const handleDayClick = (day: Date, dateKey: string) => {
    const dayStart = startOfDay(day);
    
    if (!isToday(day) && !completedDays[dateKey]?.completed) {
      if (isBefore(dayStart, today)) {
        toast({
          title: "Cannot mark past dates",
          description: "You can only mark today's date as complete.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Cannot mark future dates",
          description: "You can only mark today's date as complete.",
          variant: "destructive",
        });
      }
      return;
    }
    
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

  const handleEditGoal = () => {
    setTempGoal(mainGoal);
    setEditingGoal(true);
  };

  const saveGoal = () => {
    setMainGoal(tempGoal);
    setEditingGoal(false);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 font-mono select-none">
      {/* Goal Display Banner */}
      <div className="mb-8 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-full">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">My 2026 Goal</p>
              {mainGoal ? (
                <h2 className="text-xl md:text-2xl font-bold text-foreground">{mainGoal}</h2>
              ) : (
                <p className="text-lg text-muted-foreground italic">No goal set yet...</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="flex items-center gap-2 text-primary">
                <TrendingUp className="w-5 h-5" />
                <span className="text-2xl font-bold">{progressPercent}%</span>
              </div>
              <p className="text-xs text-muted-foreground">Progress</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-2 text-primary">
                <Calendar className="w-5 h-5" />
                <span className="text-2xl font-bold">{completedCount}/{days.length}</span>
              </div>
              <p className="text-xs text-muted-foreground">Days Done</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleEditGoal}>
              {mainGoal ? 'Edit Goal' : 'Set Goal'}
            </Button>
          </div>
        </div>
      </div>

      <header className="mb-6 text-center">
        <h1 className="text-4xl font-bold mb-2">2026</h1>
        <p className="text-sm text-muted-foreground">Click today's box to mark it complete</p>
      </header>

      <div className="flex justify-center">
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
            const isPast = isBefore(startOfDay(day), today) && !isTodayDate;
            const isFuture = !isBefore(startOfDay(day), today) && !isTodayDate;
            const canMark = isTodayDate || isCompleted;

            return (
              <TooltipProvider key={dateKey} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      onClick={() => handleDayClick(day, dateKey)}
                      onContextMenu={(e) => handleRightClick(e, dateKey)}
                      className={cn(
                        "aspect-square relative flex items-center justify-center text-[10px] sm:text-xs transition-all border",
                        monthColorClass,
                        isTodayDate && "ring-2 ring-primary ring-offset-1 z-10",
                        hasNote && !isCompleted && "ring-1 ring-inset ring-black/10",
                        canMark ? "cursor-pointer hover:brightness-95" : "cursor-not-allowed opacity-70"
                      )}
                    >
                      <span className={cn(
                        "font-medium opacity-60",
                        isCompleted && "opacity-30"
                      )}>
                        {dayOfYear}
                      </span>

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
                      {isTodayDate ? "Click to mark complete" : isCompleted ? "Already completed" : isPast ? "Past date (locked)" : "Future date (locked)"}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>

      {/* Note Dialog */}
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
            <Label htmlFor="note" className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Daily Note</Label>
            <Textarea
              id="note"
              value={tempNote}
              onChange={(e) => setTempNote(e.target.value)}
              placeholder="What did you accomplish today?"
              className="font-mono"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDate(null)}>Close</Button>
            <Button onClick={saveNote}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Goal Edit Dialog */}
      <Dialog open={editingGoal} onOpenChange={(open) => !open && setEditingGoal(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Set Your 2026 Goal
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="goal" className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
              What do you want to achieve?
            </Label>
            <Textarea
              id="goal"
              value={tempGoal}
              onChange={(e) => setTempGoal(e.target.value)}
              placeholder="e.g., Exercise every day, Learn a new language, Read 50 books..."
              className="font-mono min-h-[100px]"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              This goal will be visible at the top of your tracker to keep you motivated.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingGoal(false)}>Cancel</Button>
            <Button onClick={saveGoal}>Save Goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Month Legend */}
      <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
          <div key={month} className="flex items-center gap-2">
            <div className={cn("w-4 h-4 border", MONTH_COLORS[i])}></div> {month}
          </div>
        ))}
      </div>
    </div>
  );
}
