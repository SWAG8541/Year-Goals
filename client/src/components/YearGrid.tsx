import React, { useState } from 'react';
import { eachDayOfInterval, format, isToday, getDayOfYear, getMonth, isBefore, startOfDay, eachWeekOfInterval, startOfWeek, endOfWeek, eachMonthOfInterval, startOfMonth, endOfMonth, getWeek } from 'date-fns';
import { useYearProgress } from '@/hooks/useYearProgress';
import { useReminder } from '@/hooks/useReminder';
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ProfileCard } from '@/components/ProfileCard';
import { AttendanceCard } from '@/components/AttendanceCard';

const FESTIVALS_BY_YEAR: Record<number, Record<string, string>> = {
  2025: {
    '2025-01-14': 'Makar Sankranti / Pongal',
    '2025-01-26': 'Republic Day',
    '2025-02-26': 'Mahashivratri',
    '2025-03-14': 'Holi',
    '2025-04-06': 'Ram Navami',
    '2025-04-10': 'Mahavir Jayanti',
    '2025-04-14': 'Baisakhi / Ambedkar Jayanti',
    '2025-05-12': 'Buddha Purnima',
    '2025-08-15': 'Independence Day',
    '2025-08-27': 'Raksha Bandhan',
    '2025-09-05': 'Janmashtami',
    '2025-09-17': 'Ganesh Chaturthi',
    '2025-10-02': 'Gandhi Jayanti',
    '2025-10-22': 'Dussehra',
    '2025-11-01': 'Diwali',
    '2025-11-05': 'Guru Nanak Jayanti',
    '2025-12-25': 'Christmas',
  },
  2026: {
    '2026-01-14': 'Makar Sankranti / Pongal',
    '2026-01-26': 'Republic Day',
    '2026-02-16': 'Mahashivratri',
    '2026-03-04': 'Holi',
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
  },
  2027: {
    '2027-01-14': 'Makar Sankranti / Pongal',
    '2027-01-26': 'Republic Day',
    '2027-03-07': 'Mahashivratri',
    '2027-03-22': 'Holi',
    '2027-04-16': 'Ram Navami',
    '2027-04-14': 'Baisakhi / Ambedkar Jayanti',
    '2027-05-01': 'Buddha Purnima',
    '2027-08-15': 'Independence Day',
    '2027-08-16': 'Raksha Bandhan',
    '2027-08-25': 'Janmashtami',
    '2027-09-05': 'Ganesh Chaturthi',
    '2027-10-02': 'Gandhi Jayanti',
    '2027-10-09': 'Dussehra',
    '2027-10-19': 'Diwali',
    '2027-11-14': 'Guru Nanak Jayanti',
    '2027-12-25': 'Christmas',
  },
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

type ViewMode = 'day' | 'week' | 'month' | 'today';

export function YearGrid() {
  const { completedDays, toggleDay, setNote, mainGoal, setMainGoal } = useYearProgress();
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState("");
  const [tempDayGoal, setTempDayGoal] = useState("");
  const [editingGoal, setEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [weekDialogOpen, setWeekDialogOpen] = useState(false);
  const [monthDialogOpen, setMonthDialogOpen] = useState(false);
  const [hourDialogOpen, setHourDialogOpen] = useState(false);
  const [selectedWeekDays, setSelectedWeekDays] = useState<Date[]>([]);
  const [selectedMonthDays, setSelectedMonthDays] = useState<Date[]>([]);
  const [selectedHour, setSelectedHour] = useState<number>(0);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const { toast } = useToast();

  const currentYear = new Date().getFullYear();
  const start = new Date(currentYear, 0, 1);
  const end = new Date(currentYear, 11, 31);
  const days = eachDayOfInterval({ start, end });
  const festivals = FESTIVALS_BY_YEAR[currentYear] || {};
  
  const todayDate = format(new Date(), 'yyyy-MM-dd');
  const todayNote = completedDays[todayDate]?.note;
  useReminder(mainGoal, todayNote);

  const today = startOfDay(new Date());
  const completedCount = Object.values(completedDays).filter(d => d.completed).length;
  const progressPercent = ((completedCount / days.length) * 100).toFixed(1);

  const handleDayClick = (day: Date, dateKey: string) => {
    const dayStart = startOfDay(day);
    const isCompleted = completedDays[dateKey]?.completed;
    
    if (isCompleted) {
      toast({
        title: "Day already completed",
        description: "Completed days cannot be unmarked.",
        variant: "destructive",
      });
      return;
    }
    
    if (!isToday(day)) {
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
    const day = new Date(dateKey);
    
    if (isBefore(startOfDay(day), today) && !isToday(day)) {
      toast({
        title: "Cannot edit past dates",
        description: "You can only edit today's goal and notes.",
        variant: "destructive",
      });
      return;
    }
    
    setEditingDate(dateKey);
    setTempNote(completedDays[dateKey]?.note || "");
    setTempDayGoal(completedDays[dateKey]?.dayGoal || "");
  };

  const saveNote = () => {
    if (editingDate) {
      setNote(editingDate, tempNote, tempDayGoal);
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

  const fetchTodayAttendance = async () => {
    try {
      const response = await fetch('http://localhost:4255/api/attendance/today', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTodayAttendance(data);
      }
    } catch (error) {
      console.error('Failed to fetch today attendance:', error);
    }
  };

  const renderDayView = () => (
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
          const festival = festivals[dateKey];
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
                <TooltipContent className="text-center p-3 bg-white dark:bg-gray-800 backdrop-blur border shadow-xl">
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
  );

  const renderWeekView = () => {
    const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });
    
    return (
      <div className="flex justify-center">
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-13 gap-2">
          {weeks.map((weekStart, weekIndex) => {
            const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
            const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
            const completedInWeek = weekDays.filter(day => {
              const dateKey = format(day, 'yyyy-MM-dd');
              return completedDays[dateKey]?.completed;
            }).length;
            const weekProgress = (completedInWeek / 7) * 100;
            const weekNumber = getWeek(weekStart, { weekStartsOn: 1 });
            const hasToday = weekDays.some(day => isToday(day));
            const weekEndMonth = getMonth(weekEnd);
            const weekColorClass = MONTH_COLORS[weekEndMonth];
            
            return (
              <TooltipProvider key={weekIndex} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      onClick={() => {
                        setSelectedWeekDays(weekDays);
                        setWeekDialogOpen(true);
                      }}
                      className={cn(
                        "aspect-square relative flex flex-col items-center justify-center text-xs transition-all border-2 rounded-lg p-2",
                        weekColorClass,
                        hasToday && "ring-2 ring-primary ring-offset-1 z-10",
                        "cursor-pointer hover:brightness-95"
                      )}>
                      <span className="font-bold text-lg">{weekNumber}</span>
                      <span className="text-[10px] opacity-70">Week</span>
                      <div className="w-full bg-white/50 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-current h-1.5 rounded-full transition-all opacity-70" 
                          style={{ width: `${weekProgress}%` }}
                        />
                      </div>
                      <span className="text-[9px] mt-0.5 font-medium">{completedInWeek}/7</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="text-center p-3 bg-white dark:bg-gray-800 backdrop-blur border shadow-xl">
                    <p className="font-bold text-sm">Week {weekNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(weekStart, 'MMM do')} - {format(weekEnd, 'MMM do, yyyy')}
                    </p>
                    <p className="text-xs mt-1 text-primary/80 font-mono">
                      {completedInWeek} of 7 days completed ({weekProgress.toFixed(0)}%)
                    </p>
                    <div className="mt-2 grid grid-cols-7 gap-1">
                      {weekDays.map(day => {
                        const dateKey = format(day, 'yyyy-MM-dd');
                        const isCompleted = completedDays[dateKey]?.completed;
                        const isTodayDate = isToday(day);
                        return (
                          <div key={dateKey} className={cn(
                            "w-4 h-4 rounded-sm text-[8px] flex items-center justify-center",
                            isCompleted ? "bg-green-500 text-white" : "bg-gray-200",
                            isTodayDate && "ring-1 ring-primary"
                          )}>
                            {format(day, 'd')}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[10px] mt-1 text-muted-foreground">Click to view week details</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const months = eachMonthOfInterval({ start, end });
    
    return (
      <div className="flex justify-center">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {months.map((month, monthIndex) => {
            const monthStart = startOfMonth(month);
            const monthEnd = endOfMonth(month);
            const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
            const completedInMonth = monthDays.filter(day => {
              const dateKey = format(day, 'yyyy-MM-dd');
              return completedDays[dateKey]?.completed;
            }).length;
            const monthProgress = (completedInMonth / monthDays.length) * 100;
            const monthColorClass = MONTH_COLORS[monthIndex];
            const hasToday = monthDays.some(day => isToday(day));
            
            return (
              <TooltipProvider key={monthIndex} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      onClick={() => {
                        setSelectedMonthDays(monthDays);
                        setMonthDialogOpen(true);
                      }}
                      className={cn(
                        "aspect-square relative flex flex-col items-center justify-center text-sm transition-all border-2 rounded-xl p-4",
                        monthColorClass,
                        hasToday && "ring-2 ring-primary ring-offset-1 z-10",
                        "cursor-pointer hover:brightness-95"
                      )}>
                      <span className="font-bold text-2xl">{format(month, 'MMM')}</span>
                      <span className="text-xs opacity-70 mb-2">{format(month, 'yyyy')}</span>
                      <div className="w-full bg-white/50 rounded-full h-2 mb-1">
                        <div 
                          className="bg-current h-2 rounded-full transition-all opacity-70" 
                          style={{ width: `${monthProgress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{completedInMonth}/{monthDays.length}</span>
                      <span className="text-[10px] opacity-60">{monthProgress.toFixed(0)}%</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="text-center p-3 bg-white dark:bg-gray-800 backdrop-blur border shadow-xl">
                    <p className="font-bold text-sm">{format(month, 'MMMM yyyy')}</p>
                    <p className="text-xs mt-1 text-primary/80 font-mono">
                      {completedInMonth} of {monthDays.length} days completed ({monthProgress.toFixed(1)}%)
                    </p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {monthDays.length} days total
                    </div>
                    <p className="text-[10px] mt-1 text-muted-foreground">Click to view month details</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTodayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const currentMonthIndex = new Date().getMonth();
    const monthColorClass = MONTH_COLORS[currentMonthIndex];
    
    const getHourStatus = (hour: number) => {
      if (!todayAttendance?.checkInTime) return 'inactive';
      
      const checkIn = new Date(todayAttendance.checkInTime);
      const checkOut = todayAttendance.checkOutTime ? new Date(todayAttendance.checkOutTime) : new Date();
      const hourStart = new Date();
      hourStart.setHours(hour, 0, 0, 0);
      const hourEnd = new Date();
      hourEnd.setHours(hour, 59, 59, 999);
      
      if (hourEnd < checkIn || hourStart > checkOut) return 'inactive';
      
      const hasBreak = todayAttendance.breaks?.some((breakSession: any) => {
        const breakStart = new Date(breakSession.startTime);
        const breakEnd = breakSession.endTime ? new Date(breakSession.endTime) : new Date();
        return (breakStart <= hourEnd && breakEnd >= hourStart);
      });
      
      return hasBreak ? 'mixed' : 'working';
    };
    
    return (
      <div className="flex justify-center">
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2 max-w-4xl">
          {hours.map((hour) => {
            const status = getHourStatus(hour);
            const isCurrentHour = new Date().getHours() === hour;
            
            return (
              <TooltipProvider key={hour} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      onClick={() => {
                        setSelectedHour(hour);
                        setHourDialogOpen(true);
                        if (!todayAttendance) fetchTodayAttendance();
                      }}
                      className={cn(
                        "aspect-square flex items-center justify-center text-lg border-2 rounded-lg cursor-pointer transition-all p-2",
                        monthColorClass,
                        status === 'working' && "opacity-100",
                        status === 'mixed' && "opacity-75",
                        status === 'inactive' && "opacity-40",
                        isCurrentHour && "ring-2 ring-primary ring-offset-1"
                      )}
                    >
                      <span className="font-bold">{hour.toString().padStart(2, '0')}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="text-center p-3 bg-white dark:bg-gray-800 backdrop-blur border shadow-xl">
                    <p className="font-bold text-sm">{hour.toString().padStart(2, '0')}:00 - {hour.toString().padStart(2, '0')}:59</p>
                    <p className="text-xs text-muted-foreground capitalize">{status === 'mixed' ? 'Working + Break' : status}</p>
                    <p className="text-[10px] mt-1 text-muted-foreground">Click to view minute details</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMinuteGrid = () => {
    const minutes = Array.from({ length: 60 }, (_, i) => i);
    
    const getMinuteStatus = (minute: number) => {
      if (!todayAttendance?.checkInTime) return 'inactive';
      
      const checkIn = new Date(todayAttendance.checkInTime);
      const checkOut = todayAttendance.checkOutTime ? new Date(todayAttendance.checkOutTime) : new Date();
      const minuteTime = new Date();
      minuteTime.setHours(selectedHour, minute, 0, 0);
      
      if (minuteTime < checkIn || minuteTime > checkOut) return 'inactive';
      
      const isBreak = todayAttendance.breaks?.some((breakSession: any) => {
        const breakStart = new Date(breakSession.startTime);
        const breakEnd = breakSession.endTime ? new Date(breakSession.endTime) : new Date();
        const isInBreak = minuteTime >= breakStart && minuteTime < breakEnd;
        if (isInBreak) {
          console.log(`Minute ${minute} is in break:`, { minuteTime, breakStart, breakEnd });
        }
        return isInBreak;
      });
      
      const status = isBreak ? 'break' : 'working';
      if (minute % 10 === 0) { // Log every 10th minute for debugging
        console.log(`Minute ${minute} status:`, status, { isBreak, hasBreaks: !!todayAttendance.breaks?.length });
      }
      return status;
    };
    
    return (
      <div className="grid grid-cols-10 gap-1 p-4">
        {minutes.map((minute) => {
          const status = getMinuteStatus(minute);
          const isCurrentMinute = new Date().getHours() === selectedHour && new Date().getMinutes() === minute;
          
          return (
            <div
              key={minute}
              className={cn(
                "aspect-square flex items-center justify-center text-xs border rounded transition-all",
                status === 'working' && "bg-green-500 text-white border-green-600",
                status === 'break' && "bg-red-500 text-white border-red-600",
                status === 'inactive' && "bg-gray-200 text-gray-600 border-gray-300",
                isCurrentMinute && "ring-2 ring-primary ring-offset-1"
              )}
            >
              {minute.toString().padStart(2, '0')}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 font-mono select-none">
      {/* Profile and Attendance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ProfileCard />
        <AttendanceCard />
      </div>

      {/* Goal Display Banner */}
      <div className="mb-8 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-full">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">My {currentYear} Goal</p>
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
        <h1 className="text-4xl font-bold mb-2">{currentYear}</h1>
        <p className="text-sm text-muted-foreground mb-4">Click today's box to mark it complete</p>
        
        {/* View Toggle */}
        <div className="flex justify-center mb-4">
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as ViewMode)} className="bg-muted rounded-lg p-1">
            <ToggleGroupItem value="today" className="px-4 py-2 text-sm font-medium">
              Today
            </ToggleGroupItem>
            <ToggleGroupItem value="day" className="px-4 py-2 text-sm font-medium">
              Day
            </ToggleGroupItem>
            <ToggleGroupItem value="week" className="px-4 py-2 text-sm font-medium">
              Week
            </ToggleGroupItem>
            <ToggleGroupItem value="month" className="px-4 py-2 text-sm font-medium">
              Month
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </header>

      {/* Render based on view mode */}
      {viewMode === 'day' && renderDayView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'today' && renderTodayView()}

      {/* Note Dialog */}
      <Dialog open={!!editingDate} onOpenChange={(open) => !open && setEditingDate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDate && (
                <div className="flex flex-col gap-1">
                  <span>{format(new Date(editingDate), 'MMMM do, yyyy')}</span>
                  {festivals[editingDate] && (
                    <span className="text-sm font-normal text-amber-600">
                      🎉 {festivals[editingDate]}
                    </span>
                  )}
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div>
              <Label htmlFor="dayGoal" className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Today's Goal</Label>
              <Textarea
                id="dayGoal"
                value={tempDayGoal}
                onChange={(e) => setTempDayGoal(e.target.value)}
                placeholder="What do you want to achieve today?"
                className="font-mono"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="note" className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Daily Note</Label>
              <Textarea
                id="note"
                value={tempNote}
                onChange={(e) => setTempNote(e.target.value)}
                placeholder="What did you accomplish today?"
                className="font-mono"
                rows={3}
              />
            </div>
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
              Set Your {currentYear} Goal
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
      
      {/* Week Dialog */}
      <Dialog open={weekDialogOpen} onOpenChange={setWeekDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Week Details</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-7 gap-2 p-4">
            {selectedWeekDays.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const status = completedDays[dateKey];
              const isCompleted = status?.completed;
              const isTodayDate = isToday(day);
              const isPast = isBefore(startOfDay(day), today) && !isTodayDate;
              const canMark = isTodayDate && !isCompleted;
              const canEdit = isTodayDate || (!isPast && !isBefore(startOfDay(day), today));
              
              return (
                <div key={dateKey} className="flex flex-col items-center">
                  <div
                    onClick={() => canMark && handleDayClick(day, dateKey)}
                    onContextMenu={(e) => canEdit && handleRightClick(e, dateKey)}
                    className={cn(
                      "w-12 h-12 flex items-center justify-center text-sm border-2 rounded-lg transition-all",
                      isCompleted ? "bg-green-100 border-green-300 text-green-800" : "bg-gray-50 border-gray-200",
                      isTodayDate && "ring-2 ring-primary ring-offset-1",
                      canMark ? "cursor-pointer hover:brightness-95" : "cursor-not-allowed opacity-70"
                    )}
                  >
                    {format(day, 'd')}
                    {isCompleted && (
                      <svg className="absolute w-3 h-3 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs mt-1">{format(day, 'EEE')}</span>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Hour Dialog */}
      <Dialog open={hourDialogOpen} onOpenChange={setHourDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedHour.toString().padStart(2, '0')}:00 - {selectedHour.toString().padStart(2, '0')}:59
            </DialogTitle>
          </DialogHeader>
          {renderMinuteGrid()}
          <div className="flex justify-center gap-4 text-xs mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Working</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Break</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <span>Inactive</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Month Dialog */}
      <Dialog open={monthDialogOpen} onOpenChange={setMonthDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedMonthDays.length > 0 && format(selectedMonthDays[0], 'MMMM yyyy')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-7 gap-2 p-4">
            {selectedMonthDays.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const status = completedDays[dateKey];
              const isCompleted = status?.completed;
              const isTodayDate = isToday(day);
              const isPast = isBefore(startOfDay(day), today) && !isTodayDate;
              const canMark = isTodayDate && !isCompleted;
              const canEdit = isTodayDate || (!isPast && !isBefore(startOfDay(day), today));
              
              return (
                <div key={dateKey} className="flex flex-col items-center">
                  <div
                    onClick={() => canMark && handleDayClick(day, dateKey)}
                    onContextMenu={(e) => canEdit && handleRightClick(e, dateKey)}
                    className={cn(
                      "w-10 h-10 flex items-center justify-center text-sm border-2 rounded-lg transition-all relative",
                      isCompleted ? "bg-green-100 border-green-300 text-green-800" : "bg-gray-50 border-gray-200",
                      isTodayDate && "ring-2 ring-primary ring-offset-1",
                      canMark ? "cursor-pointer hover:brightness-95" : "cursor-not-allowed opacity-70"
                    )}
                  >
                    {format(day, 'd')}
                    {isCompleted && (
                      <svg className="absolute w-3 h-3 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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
