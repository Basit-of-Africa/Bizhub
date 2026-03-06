"use client"

import { useMemo } from 'react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, where, doc, updateDoc } from 'firebase/firestore';
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
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { triggerDealWonAutomation } from '@/lib/automation';

export default function PipelinePage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

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
        
        // Trigger OS Automation if deal is won
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
        <Button onClick={() => toast({ title: "Quick Add", description: "Use the customer profile to create new deals." })}>
          <Plus className="mr-2 h-4 w-4" /> Create Deal
        </Button>
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
