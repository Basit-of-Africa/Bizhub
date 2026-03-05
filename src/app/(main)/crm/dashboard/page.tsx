
"use client"

import { useMemo } from 'react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  TrendingUp, 
  MessageSquare, 
  PhoneOutgoing, 
  UserPlus,
  ArrowUpRight,
  History,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function CRMDashboardPage() {
  const db = useFirestore();
  const { user } = useUser();

  const customersQuery = useMemo(() => user ? query(collection(db, 'customers'), where('userId', '==', user.uid)) : null, [db, user]);
  const leadsQuery = useMemo(() => user ? query(collection(db, 'leads'), where('userId', '==', user.uid)) : null, [db, user]);
  const interactionsQuery = useMemo(() => user ? query(collection(db, 'interactions'), where('userId', '==', user.uid)) : null, [db, user]);

  const { data: customers = [], loading: loadingCust } = useCollection(customersQuery);
  const { data: leads = [], loading: loadingLeads } = useCollection(leadsQuery);
  const { data: interactions = [], loading: loadingInt } = useCollection(interactionsQuery);

  const activeCustomers = customers.filter(c => c.status === 'Active').length;
  const newLeads = leads.filter(l => l.stage !== 'Closed Won' && l.stage !== 'Closed Lost').length;
  const pipelineValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loadingCust || loadingLeads || loadingInt) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">CRM Overview</h1>
          <p className="text-muted-foreground">Monitor sales performance and customer engagement.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/crm/customers">
              <Users className="mr-2 h-4 w-4" />
              View Directory
            </Link>
          </Button>
          <Button asChild>
            <Link href="/crm/pipeline">
              <UserPlus className="mr-2 h-4 w-4" />
              Manage Pipeline
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCustomers}</div>
            <p className="text-xs text-muted-foreground">High-value accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newLeads}</div>
            <p className="text-xs text-muted-foreground">In active negotiation</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/[0.03]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(pipelineValue)}</div>
            <p className="text-xs text-muted-foreground">Estimated revenue</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Interactions</CardTitle>
                <CardDescription>Latest touchpoints with your customers.</CardDescription>
              </div>
              <History className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {interactions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No recent interactions logged.</p>
              ) : (
                interactions.map(interaction => (
                  <div key={interaction.id} className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
                    <div className={`p-2 rounded-full ${
                      interaction.type === 'Call' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      {interaction.type === 'Call' ? <PhoneOutgoing size={16} /> : <MessageSquare size={16} />}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">{interaction.customerName}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{interaction.content}</p>
                      <p className="text-xs text-muted-foreground font-mono">{new Date(interaction.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {['Discovery', 'Proposal', 'Negotiation'].map(stage => {
              const stageLeads = leads.filter(l => l.stage === stage);
              const count = stageLeads.length;
              const val = stageLeads.reduce((sum, l) => sum + (l.value || 0), 0);
              
              return (
                <div key={stage} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{stage}</span>
                    <span className="text-muted-foreground">{count} deals</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-xs text-muted-foreground">Value</span>
                    <span className="font-bold">{formatCurrency(val)}</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${leads.length > 0 ? (count / leads.length) * 100 : 0}%` }} 
                    />
                  </div>
                </div>
              );
            })}
            <Button className="w-full mt-4" variant="outline" asChild>
              <Link href="/crm/pipeline">View Full Pipeline</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
