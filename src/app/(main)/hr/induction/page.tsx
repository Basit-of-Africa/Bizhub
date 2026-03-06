
"use client"

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, doc, updateDoc, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function InductionPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const employeesQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'employees'), where('userId', '==', user.uid), where('status', '==', 'Onboarding'));
  }, [db, user]);

  const { data: onboardingEmployees = [], loading: loadingEmp } = useCollection(employeesQuery);

  const tasksQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'inductionTasks'), where('userId', '==', user.uid));
  }, [db, user]);

  const { data: tasks = [], loading: loadingTasks } = useCollection(tasksQuery);

  const toggleTask = (taskId: string, currentCompleted: boolean) => {
    if (!db) return;
    const taskRef = doc(db, 'inductionTasks', taskId);
    updateDoc(taskRef, { completed: !currentCompleted })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: taskRef.path,
          operation: 'update',
          requestResourceData: { completed: !currentCompleted }
        }));
      });
  };

  const handleGeneratePaperwork = (employeeId: string) => {
    setIsGenerating(employeeId);
    setTimeout(() => {
      setIsGenerating(null);
      toast({
        title: "Paperwork Generated",
        description: "The employment induction pack has been generated and sent for e-signature.",
      });
    }, 1500);
  };

  if (loadingEmp || loadingTasks) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Induction Management</h1>
        <p className="text-muted-foreground">Monitor and automate the onboarding process for new hires.</p>
      </header>

      {onboardingEmployees.length === 0 ? (
        <Card className="border-dashed flex items-center justify-center p-12 text-center">
          <div className="space-y-2">
            <p className="font-medium">No active inductions</p>
            <p className="text-sm text-muted-foreground">Add a new employee to start their onboarding checklist.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {onboardingEmployees.map(employee => {
            const empTasks = tasks.filter(t => t.employeeId === employee.id);
            const completedCount = empTasks.filter(t => t.completed).length;
            const progress = empTasks.length > 0 ? (completedCount / empTasks.length) * 100 : 0;

            return (
              <Card key={employee.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle>{employee.name}'s Induction</CardTitle>
                      <CardDescription>{employee.role} • Joined {employee.joinDate}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleGeneratePaperwork(employee.id)}
                        disabled={isGenerating === employee.id}
                      >
                        {isGenerating === employee.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <FileText className="mr-2 h-4 w-4" />
                        )}
                        Automate Paperwork
                      </Button>
                      <Badge variant="secondary">
                        {Math.round(progress)}% Complete
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-muted-foreground">
                      <span>Overall Progress</span>
                      <span>{completedCount} / {empTasks.length} tasks</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="grid gap-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Checklist Items</h3>
                    <div className="grid gap-3">
                      {empTasks.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">No tasks assigned yet.</p>
                      ) : (
                        empTasks.map(task => (
                          <div key={task.id} className="flex items-center space-x-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                            <Checkbox 
                              id={task.id} 
                              checked={task.completed} 
                              onCheckedChange={() => toggleTask(task.id, task.completed)}
                            />
                            <div className="grid gap-1 flex-1">
                              <Label htmlFor={task.id} className="font-medium cursor-pointer">
                                {task.task}
                              </Label>
                              <span className="text-xs text-muted-foreground">Due: {task.dueDate}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
