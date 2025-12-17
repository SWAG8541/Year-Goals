import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { CalendarDay } from "@shared/schema";

export function ExportData() {
  const { data: calendarDays = [] } = useQuery<CalendarDay[]>({
    queryKey: ['/api/calendar-days'],
  });

  const exportToCSV = () => {
    const headers = ['Date', 'Completed', 'Note'];
    const rows = calendarDays.map(day => [
      day.date,
      day.completed ? 'Yes' : 'No',
      day.note || ''
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `year-goals-${new Date().getFullYear()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" size="sm" onClick={exportToCSV}>
      <Download className="w-4 h-4 mr-2" />
      Export CSV
    </Button>
  );
}
