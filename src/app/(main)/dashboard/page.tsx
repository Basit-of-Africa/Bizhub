
"use client"

import { useMemo } from 'react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  PlusCircle, 
  Users, 
  TrendingUp, 
  Wallet, 
  AlertCircle, 
  ArrowRight,
  Briefcase,
  Contact,
  Loader2,
  Zap,
  Activity as ActivityIcon,
  Clock,
  History
} from 'lucide-react';
import Link from 'next/link';
import FinancialSummaryCards from '@/components/dashboard/financial-summary-cards';
import OverviewChart from '@/components/dashboard/overview-chart';
import FinancialHealthCard from '@/components/dashboard/financial-health-card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const db = useFirestore();
  const { user } = useUser();

  // Unified Queries
  const customersQuery = useMemo(() => user ? query(collection(db, 'customers'), where('userId', '==', user.uid)) : null, [db, user]);
  const leadsQuery = useMemo(() => user ? query(collection(db, 'leads'), where('userId', '==', user.uid)) : null, [db, user]);
  const employeesQuery = useMemo(() => user ? query(collection(db, 'employees'), where('userId', '==', user.uid)) : null, [db, user]);
  const transactionsQuery = useMemo(() => user ? query(collection(db, 'transactions'), where('userId', '==', user.uid)) : null, [db, user]);
  const activitiesQuery = useMemo(() => user ? query(collection(db, 'activities'), where('userId', '==', user.uid), orderBy('timestamp', 'desc'), limit(8)) : null, [db, user]);

  const { data: customers = [], loading: loadingCust } = useCollection(customersQuery);
  const { data: leads = [], loading: loadingLeads } = useCollection(leadsQuery);
  const { data: employees = [], loading: loadingEmp } = useCollection(employeesQuery);
  const { data: transactions = [], loading: loadingTrans } = useCollection(transactionsQuery);
  const { data: activities = [], loading: loadingAct } = useCollection(activitiesQuery);

  const pipelineValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);
  const activeStaff = employees.filter(e => e.status === 'Active').length;

  const getModuleIcon = (module: string) => {
    switch(module) {
      case 'CRM': return <Contact className="h-3 w-3" />;
      case 'Finance': return <Wallet className="h-3 w-3" />;
      case 'HR': return <Users className="h-3 w-3" />;
      case 'Operations': return <Briefcase className="h-3 w-3" />;
      default: return <ActivityIcon className="h-3 w-3" />;
    }
  };

  const SummarySkeleton = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
          <CardContent><Skeleton className="h-8 w-32" /></CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-8 pb-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            Command Center
            <Zap className="h-8 w-8 text-primary fill-current animate-pulse" />
          </h1>
          <p className="text-lg text-muted-foreground">
            Unified, intelligent view of {user?.businessName || "your business"} instance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/analytics">
              <History className="mr-2 h-4 w-4" />
              BI Reports
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/transactions">
              <PlusCircle className="mr-2 h-4 w-4" />
              Log Activity
            </Link>
          </Button>
        </div>
      </header>
      
      {loadingCust && loadingLeads && loadingEmp ? (
        <SummarySkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales Pipeline</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(pipelineValue)}
              </div>
              <p className="text-xs text-muted-foreground">{leads.length} Active deals</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeStaff}</div>
              <p className="text-xs text-muted-foreground">In organization</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customer base</CardTitle>
              <Contact className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.length}</div>
              <p className="text-xs text-muted-foreground">Relationships</p>
            </CardContent>
          </Card>
          <Card className="bg-green-500/5 border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Pulse</CardTitle>
              <ActivityIcon className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Optimal</div>
              <p className="text-xs text-muted-foreground">All modules active</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">Financial Health</CardTitle>
                <p className="text-sm text-muted-foreground">Monthly cash flow trends</p>
              </div>
            </CardHeader>
            <CardContent>
              {loadingTrans ? (
                <Skeleton className="h-[350px] w-full" />
              ) : (
                <OverviewChart transactions={transactions as any} />
              )}
            </CardContent>
          </Card>
          
          {loadingTrans ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
            </div>
          ) : (
            <FinancialSummaryCards transactions={transactions as any} />
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-lg border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Activity Ledger</CardTitle>
                <History className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardDescription>Real-time OS event log.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {loadingAct ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : activities.length === 0 ? (
                <p className="text-center py-8 text-xs text-muted-foreground">No recent system activity.</p>
              ) : (
                activities.map((act) => (
                  <div key={act.id} className="flex gap-3 relative pb-4 last:pb-0 border-l ml-1.5 pl-4">
                    <div className={`absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full border-2 border-background ${
                      act.severity === 'success' ? 'bg-green-500' : act.severity === 'warning' ? 'bg-orange-500' : 'bg-primary'
                    }`} />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                         <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-tighter px-1 h-4 flex gap-1 items-center">
                            {getModuleIcon(act.module)}
                            {act.module}
                         </Badge>
                         <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                           <Clock className="h-2.5 w-2.5" />
                           {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                      </div>
                      <p className="text-xs font-medium leading-tight">{act.action}</p>
                    </div>
                  </div>
                ))
              )}
              <Button variant="ghost" size="sm" className="w-full text-[10px] uppercase font-bold tracking-widest text-muted-foreground" asChild>
                <Link href="/analytics">View Full Audit Log</Link>
              </Button>
            </CardContent>
          </Card>

          <FinancialHealthCard transactions={transactions as any} />

          <Card className="bg-primary text-primary-foreground border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 fill-current" />
                OS Pulse
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm opacity-90 leading-relaxed">
                Business velocity is high. We detected {activities.filter(a => a.severity === 'success').length} positive events in the last hour.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" size="sm" className="text-[10px] font-bold" asChild>
                  <Link href="/crm/pipeline">Grow Sales</Link>
                </Button>
                <Button variant="secondary" size="sm" className="text-[10px] font-bold" asChild>
                  <Link href="/projects">Optimize Projects</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
