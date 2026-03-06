"use client"

import { useMemo } from 'react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Zap
} from 'lucide-react';
import Link from 'next/link';
import FinancialSummaryCards from '@/components/dashboard/financial-summary-cards';
import OverviewChart from '@/components/dashboard/overview-chart';
import FinancialHealthCard from '@/components/dashboard/financial-health-card';

export default function DashboardPage() {
  const db = useFirestore();
  const { user } = useUser();

  // Unified Queries for the "OS" view
  const customersQuery = useMemo(() => user ? query(collection(db, 'customers'), where('userId', '==', user.uid)) : null, [db, user]);
  const leadsQuery = useMemo(() => user ? query(collection(db, 'leads'), where('userId', '==', user.uid)) : null, [db, user]);
  const employeesQuery = useMemo(() => user ? query(collection(db, 'employees'), where('userId', '==', user.uid)) : null, [db, user]);
  const transactionsQuery = useMemo(() => user ? query(collection(db, 'transactions'), where('userId', '==', user.uid)) : null, [db, user]);
  const hrQueriesQuery = useMemo(() => user ? query(collection(db, 'hrQueries'), where('userId', '==', user.uid), where('status', '==', 'Open')) : null, [db, user]);

  const { data: customers = [], loading: loadingCust } = useCollection(customersQuery);
  const { data: leads = [], loading: loadingLeads } = useCollection(leadsQuery);
  const { data: employees = [], loading: loadingEmp } = useCollection(employeesQuery);
  const { data: transactions = [], loading: loadingTrans } = useCollection(transactionsQuery);
  const { data: openQueries = [], loading: loadingQueries } = useCollection(hrQueriesQuery);

  const pipelineValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);
  const activeStaff = employees.filter(e => e.status === 'Active').length;

  const isInitialLoading = loadingCust && loadingLeads && loadingEmp && loadingTrans;

  return (
    <div className="flex flex-col gap-8 pb-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            Command Center
            <Zap className="h-8 w-8 text-primary fill-current animate-pulse" />
          </h1>
          <p className="text-lg text-muted-foreground">
            Unified, intelligent view of your entire business operation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/crm/pipeline">
              <TrendingUp className="mr-2 h-4 w-4" />
              Sales Pipeline
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/transactions">
              <PlusCircle className="mr-2 h-4 w-4" />
              Log Transaction
            </Link>
          </Button>
        </div>
      </header>
      
      {isInitialLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Initializing Vela OS Intelligence...</p>
        </div>
      ) : (
        <>
          {/* Top Level OS Metrics */}
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
                <p className="text-xs text-muted-foreground">Across {new Set(employees.map(e => e.department)).size} depts</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customer Base</CardTitle>
                <Contact className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customers.length}</div>
                <p className="text-xs text-muted-foreground">Relationship count</p>
              </CardContent>
            </Card>
            <Card className={openQueries.length > 0 ? "border-destructive/50 bg-destructive/5" : ""}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Urgent Actions</CardTitle>
                <AlertCircle className={`h-4 w-4 ${openQueries.length > 0 ? "text-destructive" : "text-muted-foreground"}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{openQueries.length}</div>
                <p className="text-xs text-muted-foreground">Open HR tickets</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Financial Health</CardTitle>
                    <p className="text-sm text-muted-foreground">Monthly cash flow trends</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/transactions">Details <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <OverviewChart transactions={transactions as any} />
                </CardContent>
              </Card>
              
              <FinancialSummaryCards transactions={transactions as any} />
            </div>

            <div className="lg:col-span-1 space-y-6">
              <FinancialHealthCard transactions={transactions as any} />

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Access</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-2">
                  <Button variant="outline" className="justify-start" asChild>
                    <Link href="/crm/pipeline"><TrendingUp className="mr-2 h-4 w-4" /> Sales Pipeline</Link>
                  </Button>
                  <Button variant="outline" className="justify-start" asChild>
                    <Link href="/hr/leave"><Briefcase className="mr-2 h-4 w-4" /> Leave Approvals</Link>
                  </Button>
                  <Button variant="outline" className="justify-start" asChild>
                    <Link href="/hr/queries"><AlertCircle className="mr-2 h-4 w-4" /> Employee Helpdesk</Link>
                  </Button>
                  <Button variant="outline" className="justify-start" asChild>
                    <Link href="/predictive-insights"><Wallet className="mr-2 h-4 w-4" /> AI Forecasts</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-primary text-primary-foreground border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 fill-current" />
                    OS Insight
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm opacity-90 leading-relaxed">
                    Your customer acquisition cost is down 12% this month. The sales team in {leads.length > 0 ? "Pipeline" : "CRM"} has closed {leads.filter(l => l.stage === 'Closed Won').length} deals. High efficiency detected!
                  </p>
                  <Button variant="secondary" size="sm" className="mt-4 w-full" asChild>
                    <Link href="/hr/employees">View Team Performance</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
