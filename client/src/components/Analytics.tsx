import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Target, TrendingUp, Calendar } from "lucide-react";

async function fetchAnalytics(endpoint: string) {
  const token = localStorage.getItem("token");
  const fullUrl = endpoint.startsWith('http') ? endpoint : `http://localhost:4255${endpoint}`;
  const res = await fetch(fullUrl, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export function Analytics() {
  const year = new Date().getFullYear();
  
  const { data: stats } = useQuery({
    queryKey: ["/api/analytics/stats", year],
    queryFn: () => fetchAnalytics(`/api/analytics/stats?year=${year}`),
  });

  const { data: streakData } = useQuery({
    queryKey: ["/api/analytics/streak"],
    queryFn: () => fetchAnalytics("/api/analytics/streak"),
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          <Flame className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{streakData?.streak || 0} days</div>
          <p className="text-xs text-muted-foreground">Keep it going!</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Days</CardTitle>
          <Calendar className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.total || 0}</div>
          <p className="text-xs text-muted-foreground">Days tracked in {year}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <Target className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.completed || 0}</div>
          <p className="text-xs text-muted-foreground">Days completed</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.percentage || 0}%</div>
          <Progress value={stats?.percentage || 0} className="mt-2" />
        </CardContent>
      </Card>
    </div>
  );
}
