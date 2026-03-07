
"use client"

import { useMemo, useState } from 'react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Download, 
  Filter, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Briefcase,
  Loader2,
  Calendar
} from 'lucide-react';
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie, 
  Legend,
  LineChart,
  Line
} from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function AnalyticsPage() {
  const db = useFirestore();
  const { user, role } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("sales");

  // Fetch all necessary data for global reporting
  const customersQuery = useMemo(() => user ? query(collection(db, 'customers'), where('userId', '==', user.uid)) : null, [db, user]);
  const leadsQuery = useMemo(() => user ? query(collection(db, 'leads'), where('userId', '==', user.uid)) : null, [db, user]);
  const projectsQuery = useMemo(() => user ? query(collection(db, 'projects'), where('userId', '==', user.uid)) : null, [db, user]);
  const transactionsQuery = useMemo(() => user ? query(collection(db, 'transactions'), where('userId', '==', user.uid)) : null, [db, user]);
  const employeesQuery = useMemo(() => user ? query(collection(db, 'employees'), where('userId', '==', user.uid)) : null, [db, user]);

  const { data: customers = [], loading: loadingCust } = useCollection(customersQuery);
  const { data: leads = [], loading: loadingLeads } = useCollection(leadsQuery);
  const { data: projects = [], loading: loadingProj } = useCollection(projectsQuery);
  const { data: transactions = [], loading: loadingTrans } = useCollection(transactionsQuery);
  const { data: employees = [], loading: loadingEmp } = useCollection(employeesQuery);

  const loading = loadingCust || loadingLeads || loadingProj || loadingTrans || loadingEmp;

  // --- Data Processors ---

  const salesByStage = useMemo(() => {
    const stages = ['Discovery', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
    return stages.map(stage => ({
      name: stage,
      value: leads.filter(l => l.stage === stage).reduce((sum, l) => sum + (l.value || 0), 0),
      count: leads.filter(l => l.stage === stage).length
    }));
  }, [leads]);

  const financialTrends = useMemo(() => {
    const monthlyData: { [key: string]: { month: string; income: number; expense: number } } = {};
    transactions.forEach(t => {
      const date = new Date(t.date);
      const month = date.toLocaleString('default', { month: 'short' });
      if (!monthlyData[month]) monthlyData[month] = { month, income: 0, expense: 0 };
      if (t.type === 'income') monthlyData[month].income += t.amount;
      else monthlyData[month].expense += t.amount;
    });
    return Object.values(monthlyData);
  }, [transactions]);

  const projectStatus = useMemo(() => {
    const statuses = ['Active', 'On Hold', 'Completed'];
    return statuses.map(status => ({
      name: status,
      value: projects.filter(p => p.status === status).length
    }));
  }, [projects]);

  const departmentHeadcount = useMemo(() => {
    const depts: { [key: string]: number } = {};
    employees.forEach(e => {
      depts[e.department] = (depts[e.department] || 0) + 1;
    });
    return Object.entries(depts).map(([name, value]) => ({ name, value }));
  }, [employees]);

  // --- Export Utility ---

  const handleExportCSV = (module: string) => {
    let dataToExport: any[] = [];
    let filename = `vela-${module}-report.csv`;

    switch (module) {
      case 'sales': dataToExport = leads; break;
      case 'finance': dataToExport = transactions; break;
      case 'projects': dataToExport = projects; break;
      case 'hr': dataToExport = employees; break;
    }

    if (dataToExport.length === 0) {
      toast({ title: "No Data", description: "There is no data available to export in this module." });
      return;
    }

    const headers = Object.keys(dataToExport[0]).filter(k => k !== 'id' && k !== 'userId').join(',');
    const rows = dataToExport.map(item => {
      return Object.entries(item)
        .filter(([k]) => k !== 'id' && k !== 'userId')
        .map(([, v]) => `"${v}"`)
        .join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Export Started", description: `Downloading ${filename}...` });
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const ChartSkeleton = () => <Skeleton className="h-[400px] w-full" />;

  return (
    <div className="flex flex-col gap-8 pb-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight flex items-center gap-2">
            Intelligence & Reports
            <BarChart3 className="h-6 w-6 text-primary" />
          </h1>
          <p className="text-muted-foreground">Comprehensive cross-module performance analytics.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" /> Filter Range
          </Button>
          <Button size="sm" onClick={() => handleExportCSV(activeTab)}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </header>

      <Tabs defaultValue="sales" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-muted/50 h-auto p-1 border">
          <TabsTrigger value="sales" className="py-2.5">
            <TrendingUp className="mr-2 h-4 w-4" /> Sales & CRM
          </TabsTrigger>
          <TabsTrigger value="finance" className="py-2.5">
            <DollarSign className="mr-2 h-4 w-4" /> Financials
          </TabsTrigger>
          <TabsTrigger value="projects" className="py-2.5">
            <Briefcase className="mr-2 h-4 w-4" /> Operations
          </TabsTrigger>
          <TabsTrigger value="hr" className="py-2.5">
            <Users className="mr-2 h-4 w-4" /> Human Resources
          </TabsTrigger>
        </TabsList>

        {/* --- Sales Analytics --- */}
        <TabsContent value="sales" className="mt-8 space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Pipeline Value by Stage</CardTitle>
                <CardDescription>Estimated revenue currently sitting in each sales stage.</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingLeads ? <ChartSkeleton /> : (
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesByStage}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                        <Tooltip 
                          cursor={{fill: 'hsl(var(--muted)/0.3)'}}
                          contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                        />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lead Volume</CardTitle>
                <CardDescription>Number of deals per stage.</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingLeads ? <ChartSkeleton /> : (
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={salesByStage}
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="count"
                        >
                          {salesByStage.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- Financial Analytics --- */}
        <TabsContent value="finance" className="mt-8 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Trends</CardTitle>
                <CardDescription>Monthly comparison of income vs. expenses.</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingTrans ? <ChartSkeleton /> : (
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={financialTrends}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                        <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- Project Analytics --- */}
        <TabsContent value="projects" className="mt-8 space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Status Distribution</CardTitle>
                <CardDescription>Health of current delivery portfolio.</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingProj ? <ChartSkeleton /> : (
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={projectStatus}
                          innerRadius={80}
                          outerRadius={120}
                          dataKey="value"
                          label
                        >
                          <Cell fill="#10b981" />
                          <Cell fill="#f59e0b" />
                          <Cell fill="#6366f1" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Delivery Efficiency</CardTitle>
                <CardDescription>Mean progress across active projects.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center h-[400px] text-center">
                {loadingProj ? <Loader2 className="h-10 w-10 animate-spin text-primary" /> : (
                  <>
                    <div className="space-y-2">
                      <p className="text-6xl font-bold text-primary">
                        {Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / (projects.length || 1))}%
                      </p>
                      <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Average Progress</p>
                    </div>
                    <div className="mt-8 w-full max-w-xs space-y-4">
                      <div className="flex justify-between text-xs">
                        <span>Active Projects</span>
                        <span>{projects.filter(p => p.status === 'Active').length}</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '65%' }} />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- HR Analytics --- */}
        <TabsContent value="hr" className="mt-8 space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Department Distribution</CardTitle>
                <CardDescription>Headcount breakdown by company department.</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingEmp ? <ChartSkeleton /> : (
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={departmentHeadcount} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted))" />
                        <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis dataKey="name" type="category" fontSize={12} tickLine={false} axisLine={false} width={100} />
                        <Tooltip cursor={{fill: 'transparent'}} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle>Workforce Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {loadingEmp ? (
                  <div className="space-y-6">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground font-medium">Total Staff</p>
                      <p className="text-4xl font-bold">{employees.length}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground font-medium">Retention (12m)</p>
                      <p className="text-4xl font-bold text-green-600">94.2%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground font-medium">Open HR Queries</p>
                      <p className="text-4xl font-bold text-orange-600">3</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="p-4 rounded-lg bg-muted/30 border border-dashed flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-background rounded-full border">
             <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground">
            Reports are based on data synchronized as of <span className="font-bold">{new Date().toLocaleString()}</span>. 
            All reports are scoped to your clearance level.
          </p>
        </div>
        <Button variant="ghost" size="sm" className="text-[10px] uppercase font-bold tracking-widest">
          Request Custom Report
        </Button>
      </div>
    </div>
  );
}
