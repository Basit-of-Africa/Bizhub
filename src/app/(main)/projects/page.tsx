"use client"

import { useMemo, useState } from 'react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, where, doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Briefcase, 
  MoreVertical,
  Plus,
  Loader2,
  Zap,
  Target,
  FileText,
  Sparkles,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { getClientStatusReport } from '@/lib/actions';
import type { Project } from '@/lib/types';
import type { ClientStatusReportOutput } from '@/ai/flows/client-status-report-flow';

export default function ProjectsPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [activeReport, setActiveReport] = useState<ClientStatusReportOutput | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const projectsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'projects'), where('userId', '==', user.uid));
  }, [db, user]);

  const { data: projects = [], loading } = useCollection<Project>(projectsQuery as any);

  const statuses: Project['status'][] = ['Active', 'On Hold', 'Completed'];

  const handleUpdateStatus = (projectId: string, newStatus: Project['status']) => {
    if (!db) return;
    const docRef = doc(db, 'projects', projectId);
    updateDoc(docRef, { status: newStatus })
      .then(() => toast({ title: "Project Updated", description: `Status changed to ${newStatus}` }))
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: { status: newStatus }
        }));
      });
  };

  const handleUpdateProgress = (projectId: string, currentProgress: number) => {
    if (!db) return;
    const newProgress = Math.min(100, currentProgress + 10);
    const docRef = doc(db, 'projects', projectId);
    updateDoc(docRef, { progress: newProgress })
      .then(() => toast({ title: "Progress Tracked", description: `Now at ${newProgress}%` }))
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: { progress: newProgress }
        }));
      });
  };

  const handleGenerateReport = async (project: Project) => {
    setIsGeneratingReport(true);
    const result = await getClientStatusReport({
      projectTitle: project.title,
      customerName: project.customerName,
      progress: project.progress,
      budget: project.budget,
      dueDate: project.dueDate,
      status: project.status,
    });

    if (result.success && result.data) {
      setActiveReport(result.data);
      setIsReportOpen(true);
    } else {
      toast({
        variant: "destructive",
        title: "AI Generation Failed",
        description: result.error || "Could not generate report.",
      });
    }
    setIsGeneratingReport(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            Projects & Delivery
            <Briefcase className="h-6 w-6 text-primary" />
          </h1>
          <p className="text-muted-foreground">Manage ongoing client work. Use AI to generate professional status reports.</p>
        </div>
        <Button onClick={() => toast({ title: "Info", description: "Projects are automatically created from won sales deals." })}>
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {statuses.map(status => {
            const statusProjects = projects.filter(p => p.status === status);
            
            return (
              <div key={status} className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{status}</h3>
                  <Badge variant="secondary">{statusProjects.length}</Badge>
                </div>

                <div className="space-y-4 min-h-[600px] rounded-xl bg-muted/20 p-3 border border-dashed border-muted">
                  {statusProjects.length === 0 ? (
                    <div className="py-12 text-center text-xs text-muted-foreground">No projects in {status}</div>
                  ) : (
                    statusProjects.map(project => (
                      <Card key={project.id} className="group relative overflow-hidden hover:shadow-md transition-all">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base font-bold group-hover:text-primary transition-colors">{project.title}</CardTitle>
                              <CardDescription className="flex items-center gap-1 mt-1">
                                <Target className="h-3 w-3" /> {project.customerName}
                              </CardDescription>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {statuses.filter(s => s !== status).map(s => (
                                  <DropdownMenuItem key={s} onClick={() => handleUpdateStatus(project.id, s)}>
                                    Move to {s}
                                  </DropdownMenuItem>
                                ))}
                                <DropdownMenuItem onClick={() => handleGenerateReport(project)} className="text-primary font-medium">
                                  <Sparkles className="mr-2 h-3 w-3" /> Generate AI Report
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs font-medium">
                              <span>Progress</span>
                              <span>{project.progress}%</span>
                            </div>
                            <Progress value={project.progress} className="h-1.5" />
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="space-y-1">
                              <p className="text-[10px] uppercase font-bold text-muted-foreground">Budget</p>
                              <p className="text-sm font-bold">{formatCurrency(project.budget)}</p>
                            </div>
                            <div className="space-y-1 text-right">
                              <p className="text-[10px] uppercase font-bold text-muted-foreground">Due Date</p>
                              <p className="text-sm font-medium">{project.dueDate || 'TBD'}</p>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="grid grid-cols-2 gap-2 pt-0">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs" 
                            onClick={() => handleUpdateProgress(project.id, project.progress)}
                            disabled={project.progress >= 100 || status === 'Completed'}
                          >
                            <Zap className="mr-1.5 h-3 w-3 text-primary fill-primary" />
                            Log Progress
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs text-primary hover:text-primary hover:bg-primary/5" 
                            onClick={() => handleGenerateReport(project)}
                            disabled={isGeneratingReport}
                          >
                            {isGeneratingReport ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="mr-1.5 h-3 w-3" />}
                            AI Report
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Client Report Dialog */}
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary font-bold mb-1">
              <Sparkles className="h-5 w-5" />
              <span>AI Agent Output</span>
            </div>
            <DialogTitle className="text-2xl">{activeReport?.reportTitle}</DialogTitle>
            <DialogDescription>
              Professional status summary generated based on current delivery metrics.
            </DialogDescription>
          </DialogHeader>

          {activeReport && (
            <div className="space-y-6 py-4">
              <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                  <FileText className="h-3 w-3" /> Executive Summary
                </h4>
                <p className="text-sm leading-relaxed">{activeReport.executiveSummary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" /> Key Achievements
                  </h4>
                  <ul className="space-y-2">
                    {activeReport.achievements.map((item, i) => (
                      <li key={i} className="text-xs flex gap-2">
                        <span className="text-primary">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-blue-500" /> Next Steps
                  </h4>
                  <ul className="space-y-2">
                    {activeReport.nextSteps.map((item, i) => (
                      <li key={i} className="text-xs flex gap-2">
                        <span className="text-primary">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Financial Note</h4>
                  <p className="text-sm font-medium">{activeReport.financialHealth}</p>
                </div>
                <Badge variant={activeReport.overallSentiment === 'Positive' ? 'default' : 'outline'}>
                  {activeReport.overallSentiment} Sentiment
                </Badge>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReportOpen(false)}>Close</Button>
            <Button onClick={() => {
              toast({ title: "Copied", description: "Report content copied to clipboard." });
              setIsReportOpen(false);
            }}>
              Copy to Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
