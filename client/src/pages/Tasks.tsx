import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Target, CheckCircle, Circle, Trash2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
  createdAt: Date;
}

export default function Tasks() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<{ [goalId: string]: Task[] }>({});
  const [newGoal, setNewGoal] = useState({ title: "", description: "" });
  const [newTask, setNewTask] = useState({ title: "", description: "", goalId: "" });
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await fetch('http://localhost:4255/api/goals', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        credentials: 'include'
      });
      if (res.ok) {
        const goalsData = await res.json();
        setGoals(goalsData);
        // Fetch tasks for each goal
        goalsData.forEach((goal: Goal) => fetchTasks(goal.id));
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const fetchTasks = async (goalId: string) => {
    try {
      const res = await fetch(`http://localhost:4255/api/tasks/${goalId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        credentials: 'include'
      });
      if (res.ok) {
        const tasksData = await res.json();
        setTasks(prev => ({ ...prev, [goalId]: tasksData }));
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const createGoal = async () => {
    if (!newGoal.title.trim()) return;
    
    try {
      const res = await fetch('http://localhost:4255/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newGoal),
        credentials: 'include'
      });
      
      if (res.ok) {
        const goal = await res.json();
        setGoals([...goals, goal]);
        setTasks(prev => ({ ...prev, [goal._id]: [] }));
        setNewGoal({ title: "", description: "" });
        setGoalDialogOpen(false);
        toast({ title: "Success", description: "Goal created successfully" });
      }
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({ title: "Error", description: "Failed to create goal", variant: "destructive" });
    }
  };

  const createTask = async () => {
    if (!newTask.title.trim() || !newTask.goalId) return;
    
    try {
      const res = await fetch('http://localhost:4255/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newTask),
        credentials: 'include'
      });
      
      if (res.ok) {
        const task = await res.json();
        setTasks(prev => ({
          ...prev,
          [newTask.goalId]: [...(prev[newTask.goalId] || []), task]
        }));
        setNewTask({ title: "", description: "", goalId: "" });
        setTaskDialogOpen(false);
        toast({ title: "Success", description: "Task created successfully" });
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast({ title: "Error", description: "Failed to create task", variant: "destructive" });
    }
  };

  const toggleTask = async (goalId: string, taskId: string) => {
    try {
      const res = await fetch(`http://localhost:4255/api/tasks/${taskId}/toggle`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        credentials: 'include'
      });
      
      if (res.ok) {
        const updatedTask = await res.json();
        setTasks(prev => ({
          ...prev,
          [goalId]: prev[goalId]?.map(task => 
            task._id === taskId ? updatedTask : task
          ) || []
        }));
      }
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const res = await fetch(`http://localhost:4255/api/goals/${goalId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        credentials: 'include'
      });
      
      if (res.ok) {
        setGoals(goals.filter(goal => goal._id !== goalId));
        setTasks(prev => {
          const newTasks = { ...prev };
          delete newTasks[goalId];
          return newTasks;
        });
        toast({ title: "Success", description: "Goal deleted successfully" });
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({ title: "Error", description: "Failed to delete goal", variant: "destructive" });
    }
  };

  const deleteTask = async (goalId: string, taskId: string) => {
    try {
      const res = await fetch(`http://localhost:4255/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        credentials: 'include'
      });
      
      if (res.ok) {
        setTasks(prev => ({
          ...prev,
          [goalId]: prev[goalId]?.filter(task => task._id !== taskId) || []
        }));
        toast({ title: "Success", description: "Task deleted successfully" });
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({ title: "Error", description: "Failed to delete task", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar currentPage="tasks" />
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">Organize your goals and break them into actionable tasks</p>
          
          <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Goal title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                />
                <Textarea
                  placeholder="Goal description"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                />
                <Button onClick={createGoal} className="w-full">Create Goal</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          {goals.map((goal) => {
            const goalTasks = tasks[goal._id] || [];
            const completedTasks = goalTasks.filter(task => task.completed).length;
            const progress = goalTasks.length > 0 ? (completedTasks / goalTasks.length) * 100 : 0;
            
            return (
              <Card key={goal._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Target className="w-6 h-6 text-primary" />
                      <div>
                        <CardTitle>{goal.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {completedTasks}/{goalTasks.length} tasks completed ({progress.toFixed(0)}%)
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setNewTask({ ...newTask, goalId: goal._id })}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Task
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Task to {goal.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="Task title"
                              value={newTask.title}
                              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                            />
                            <Textarea
                              placeholder="Task description"
                              value={newTask.description}
                              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                            />
                            <Button onClick={createTask} className="w-full">Add Task</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => deleteGoal(goal._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {goalTasks.map((task) => (
                      <div key={task._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <button onClick={() => toggleTask(goal._id, task._id)}>
                            {task.completed ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                          <div>
                            <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-sm text-muted-foreground">{task.description}</p>
                            )}
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => deleteTask(goal._id, task._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {goalTasks.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No tasks yet. Add your first task to get started!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {goals.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Goals Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first goal to start organizing your tasks and tracking progress.
                </p>
                <Button onClick={() => setGoalDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Goal
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}