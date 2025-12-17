import React, { useState, useEffect } from 'react';
import { Clock, Play, Square, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface AttendanceData {
  status: 'not-started' | 'working' | 'on-break' | 'checked-out';
  checkInTime?: string;
  checkOutTime?: string;
  workingHours: number;
  breakTime: number;
  currentBreakStart?: string;
}

export function AttendanceCard() {
  const [attendance, setAttendance] = useState<AttendanceData>({
    status: 'not-started',
    workingHours: 0,
    breakTime: 0
  });
  const [liveWorkingTime, setLiveWorkingTime] = useState(0);
  const [liveBreakTime, setLiveBreakTime] = useState(0);
  const [initialCheckInTime, setInitialCheckInTime] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      updateLiveTimes();
    }, 1000);
    return () => clearInterval(timer);
  }, [attendance]);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const updateLiveTimes = () => {
    if (attendance.status === 'working' && (attendance.checkInTime || initialCheckInTime)) {
      const now = new Date();
      const checkIn = new Date(initialCheckInTime || attendance.checkInTime!);
      const currentWorking = Math.floor((now.getTime() - checkIn.getTime()) / (1000 * 60));
      setLiveWorkingTime(attendance.workingHours + currentWorking);
    } else {
      setLiveWorkingTime(attendance.workingHours);
    }

    if (attendance.status === 'on-break' && attendance.currentBreakStart) {
      const now = new Date();
      const breakStart = new Date(attendance.currentBreakStart);
      const currentBreak = Math.floor((now.getTime() - breakStart.getTime()) / (1000 * 60));
      setLiveBreakTime(attendance.breakTime + currentBreak);
    } else {
      setLiveBreakTime(attendance.breakTime);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await fetch('http://localhost:4255/api/attendance/today', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAttendance(data);
        if (data.checkInTime && !initialCheckInTime) {
          setInitialCheckInTime(data.checkInTime);
        }
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    }
  };

  const handleClockIn = async () => {
    try {
      const response = await fetch('http://localhost:4255/api/attendance/clock-in', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const now = new Date().toISOString();
        setInitialCheckInTime(now);
        fetchAttendance();
      }
    } catch (error) {
      console.error('Failed to clock in:', error);
    }
  };

  const handleClockOut = async () => {
    try {
      const response = await fetch('http://localhost:4255/api/attendance/clock-out', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        fetchAttendance();
      }
    } catch (error) {
      console.error('Failed to clock out:', error);
    }
  };

  const handleBreakStart = async () => {
    try {
      const response = await fetch('http://localhost:4255/api/attendance/break-start', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        fetchAttendance();
      }
    } catch (error) {
      console.error('Failed to start break:', error);
    }
  };

  const handleBreakEnd = async () => {
    try {
      const response = await fetch('http://localhost:4255/api/attendance/break-end', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        fetchAttendance();
      }
    } catch (error) {
      console.error('Failed to end break:', error);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusBadge = () => {
    switch (attendance.status) {
      case 'working':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Working</span>;
      case 'on-break':
        return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">On Break</span>;
      case 'checked-out':
        return <span className="px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium">Checked Out</span>;
      default:
        return <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">Not Started</span>;
    }
  };

  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Today</h3>
        {getStatusBadge()}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Check In</p>
          <p className="text-2xl font-bold text-primary">
            {initialCheckInTime ? format(new Date(initialCheckInTime), 'h:mm a') : '--:--'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Check Out</p>
          <p className="text-2xl font-bold text-primary">
            {attendance.checkOutTime ? format(new Date(attendance.checkOutTime), 'h:mm a') : '--:--'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Working Hours</p>
          <p className="text-xl font-bold">{formatTime(liveWorkingTime)}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Break Time</p>
          <p className="text-xl font-bold">{formatTime(liveBreakTime)}</p>
        </div>
      </div>

      <div className="space-y-2">
        {attendance.status === 'not-started' && (
          <Button onClick={handleClockIn} className="w-full">
            <Play className="w-4 h-4 mr-2" />
            Check In
          </Button>
        )}

        {attendance.status === 'working' && (
          <>
            <Button onClick={handleBreakStart} variant="outline" className="w-full">
              <Coffee className="w-4 h-4 mr-2" />
              Start Break
            </Button>
            <Button onClick={handleClockOut} variant="outline" className="w-full">
              <Square className="w-4 h-4 mr-2" />
              Check Out
            </Button>
          </>
        )}

        {attendance.status === 'on-break' && (
          <Button onClick={handleBreakEnd} className="w-full">
            <Play className="w-4 h-4 mr-2" />
            End Break
          </Button>
        )}

        {attendance.status === 'checked-out' && (
          <div className="text-center py-4">
            <p className="text-muted-foreground font-medium">Work day completed!</p>
          </div>
        )}
      </div>
    </div>
  );
}