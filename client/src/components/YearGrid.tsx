import React, { useState } from 'react';
import { eachDayOfInterval, format, isToday, isFuture, isSameMonth, startOfMonth, getMonth } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Edit2 } from 'lucide-react';
import { useYearProgress } from '@/hooks/useYearProgress';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
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

  const handleEditNote = (dateKey: string) => {
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
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 font-mono select-none">
      <header className="mb-12 text-center space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-primary/80 font-hand">2026</h1>
          <p className="text-muted-foreground uppercase tracking-widest text-xs">Year In Pixels</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative max-w-md mx-auto group"
        >
          <input
            type="text"
            value={mainGoal}
            onChange={(e) => setMainGoal(e.target.value)}
            placeholder="What is your main goal for 2026?"
            className="w-full text-center bg-transparent border-b-2 border-dashed border-primary/20 py-2 text-xl md:text-2xl focus:outline-none focus:border-primary/60 placeholder:text-muted-foreground/30 font-hand transition-colors text-primary"
          />
          <span className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground">
            <Edit2 className="w-4 h-4" />
          </span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center gap-8 text-xs text-muted-foreground font-sans"
        >
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 dashed-box rounded-sm" />
             <span>Pending</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 bg-accent/30 border border-primary rounded-sm flex items-center justify-center">
               <X className="w-2 h-2 text-primary" />
             </div>
             <span>Done</span>
           </div>
        </motion.div>
      </header>

      <div className="flex flex-wrap gap-x-8 gap-y-8 justify-center">
        {/* Render grid... maybe plain grid is best? The reference is a plain grid. */}
        {/* Let's keep the plain grid but break it slightly if screen is wide? No, pure grid is the vibe. */}
        
        <div className="grid grid-cols-7 xs:grid-cols-10 sm:grid-cols-14 md:grid-cols-18 lg:grid-cols-21 gap-1.5 md:gap-2">
          {days.map((day, i) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const status = completedDays[dateKey];
            const isCompleted = status?.completed;
            const isTodayDate = isToday(day);
            const monthStart = day.getDate() === 1;
            
            return (
              <React.Fragment key={dateKey}>
                {/* Optional: Add month marker if it's the 1st, but inside the grid flow it's hard. 
                    Let's just use tooltip for month info. 
                */}
                <ContextMenu>
                  <ContextMenuTrigger>
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.001 }} // Stagger effect
                            whileHover={{ scale: 1.15, zIndex: 10 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toggleDay(dateKey)}
                            className={cn(
                              "w-6 h-6 md:w-8 md:h-8 relative flex items-center justify-center rounded-sm transition-all duration-200",
                              // Base style
                              "dashed-box",
                              // Completed style
                              isCompleted && "border border-solid border-primary bg-accent/20 dashed-box-none",
                              // Today style
                              isTodayDate && "ring-2 ring-offset-2 ring-primary ring-offset-background"
                            )}
                            style={{
                              // remove background image if completed to avoid clash
                              backgroundImage: isCompleted ? 'none' : undefined
                            }}
                          >
                            <AnimatePresence mode="wait">
                              {isCompleted && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                  exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                                  className="text-primary"
                                >
                                  {/* Hand-drawn X SVG */}
                                  <svg width="80%" height="80%" viewBox="0 0 24 24" className="w-5 h-5 md:w-6 md:h-6 overflow-visible">
                                    <path 
                                      d="M 5 5 L 19 19" 
                                      fill="transparent" 
                                      stroke="currentColor" 
                                      strokeWidth="2.5" 
                                      strokeLinecap="round"
                                      className="hand-drawn-x"
                                      style={{ animationDelay: '0ms' }}
                                    />
                                    <path 
                                      d="M 19 5 L 5 19" 
                                      fill="transparent" 
                                      stroke="currentColor" 
                                      strokeWidth="2.5" 
                                      strokeLinecap="round" 
                                      className="hand-drawn-x"
                                      style={{ animationDelay: '100ms' }}
                                    />
                                  </svg>
                                </motion.div>
                              )}
                            </AnimatePresence>
                            
                            {/* Note indicator dot */}
                            {status?.note && (
                              <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full shadow-sm" />
                            )}
                          </motion.button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-center p-2 bg-primary text-primary-foreground border-none shadow-xl">
                          <p className="font-bold text-sm">{format(day, 'MMM d')}</p>
                          <p className="text-xs opacity-80">{format(day, 'EEEE')}</p>
                          {status?.note && (
                            <div className="mt-2 pt-2 border-t border-white/20 text-xs italic max-w-[150px] break-words">
                              "{status.note}"
                            </div>
                          )}
                          <div className="mt-1 text-[10px] opacity-60">
                            Right-click for note
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem onSelect={() => handleEditNote(dateKey)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      {status?.note ? 'Edit Note' : 'Add Note'}
                    </ContextMenuItem>
                    <ContextMenuItem onSelect={() => toggleDay(dateKey)}>
                      {isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <Dialog open={!!editingDate} onOpenChange={(open) => !open && setEditingDate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Note for {editingDate && format(new Date(editingDate), 'MMMM do, yyyy')}</DialogTitle>
            <DialogDescription>
              Add a note or specific goal for this day.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="note" className="mb-2 block">Daily Goal / Note</Label>
            <Textarea
              id="note"
              value={tempNote}
              onChange={(e) => setTempNote(e.target.value)}
              placeholder="E.g. Ran 5km, Read 20 pages..."
              className="min-h-[100px] font-hand text-lg"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDate(null)}>Cancel</Button>
            <Button onClick={saveNote}>Save Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
