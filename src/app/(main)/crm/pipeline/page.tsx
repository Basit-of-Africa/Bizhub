
"use client"

import { useMemo, useState } from 'react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, where, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  MoreVertical,
  Target,
  Plus,
  Loader2,
  Zap
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
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { triggerDealWonAutomation } from '@/lib/automation';

export default function PipelinePage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  const leadsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'leads'), where('userId', '==', user.uid));
  }, [db, user]);

  const { data: leads = [], loading } = useCollection(leadsQuery);

  const stages = ['Discovery', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const updateLeadStage = (leadId: string, newStage: string, leadData: any) => {
    if (!db || !user) return;
    const leadRef = doc(db, 'leads', leadId);
    
    updateDoc(leadRef, { stage: newStage })
      .then(() => {
        toast({ title: "Updated", description: `Deal moved to ${newStage}` });
        
        if (newStage === 'Closed Won') {
          toast({
            title: "Deal Won!",
            description: "Kickoff automation has been triggered.",
          });
          triggerDealWonAutomation(db, user.uid, {
            title: leadData.title,
            customerName: leadData.customerName,
            value: leadData.value
          });
        }
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: leadRef.path,
          operation: 'update',
          requestResourceData: { stage: newStage }
        }));
      });
  };

  const handleCreateLead = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db || !user) return;

    const formData = new FormData(e.currentTarget);
    const newLead = {
      userId: user.uid,
      title: formData.get('title') as string,
      customerName: formData.get('customerName') as string,
      value: parseFloat(formData.get('value') as string) || 0,
      stage: 'Discovery',
      probability: 10,
      createdAt: new Date().toISOString(),
    };

    addDoc(collection(db, 'leads'), newLead)
      .then(() => {
        toast({ title: "Deal Created", description: "The opportunity has been added to Discovery." });
        setIsAdding(false);
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'leads',
          operation: 'create',
          requestResourceData: newLead
        }));
      });
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Sales Pipeline
            <Zap className="h-5 w-5 text-primary fill-current" />
          </h1>
          <p className="text-muted-foreground">Track deals and revenue growth. "Closed Won" triggers project kickoff automation.</p>
        </div>

        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Deal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Sales Opportunity</DialogTitle>
              <DialogDescription>Add a new deal to your pipeline tracker.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateLead} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Deal Title</Label>
                <Input id="title" name="title" required placeholder="e.g. Website Redesign" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input id="customerName" name="customerName" required placeholder="e.g. Acme Corp" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="value">Estimated Value ($)</Label>
                <Input id="value" name="value" type="number" step="0.01" required placeholder="5000" />
              </div>
              <DialogFooter>
                <Button type="submit">Initialize Deal</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
          {stages.map(stage => {
            const stageLeads = leads.filter(l => l.stage === stage);
            const totalValue = stageLeads.reduce((sum, l) => sum + (l.value || 0), 0);

            return (
              <div key={stage} className="flex-shrink-0 w-80 space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{stage}</h3>
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                      {stageLeads.length}
                    </Badge>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">
                    {formatCurrency(totalValue)}
                  </span>
                </div>

                <div className="space-y-3 min-h-[500px] rounded-lg bg-muted/30 p-2">
                  {stageLeads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                      <p className="text-xs">No deals here</p>
                    </div>
                  ) : (
                    stageLeads.map(lead => (
                      <Card key={lead.id} className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-primary/40">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-bold leading-tight">{lead.title}</h4>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2">
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {stages.filter(s => s !== stage).map(s => (
                                  <DropdownMenuItem key={s} onClick={() => updateLeadStage(lead.id, s, lead)}>
                                    Move to {s}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Target className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{lead.customerName}</span>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3 text-primary" />
                              <span className="text-sm font-bold">{formatCurrency(lead.value)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3 text-green-500" />
                              <span className="text-xs font-medium">{lead.probability}%</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                            <Clock className="h-3 w-3" />
                            Created {new Date(lead.createdAt).toLocaleDateString()}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
