
"use client"

import { useMemo } from 'react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserCheck, 
  CalendarClock, 
  AlertCircle, 
  Plus,
  ArrowRight,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function HRDashboardPage() {
  const db = useFirestore();
  const { user } = useUser();

  const employeesQuery = useMemo(() => user ? query(collection(db, 'employees'), where('userId', '==', user.uid)) : null, [db, user]);
  const leaveRequestsQuery = useMemo(() => user ? query(collection(db, 'leaveRequests'), where('userId', '==', user.uid)) : null, [db, user]);
  const hrQueriesQuery = useMemo(() => user ? query(collection(db, 'hrQueries'), where('userId', '==', user.uid)) : null, [db, user]);

  const { data: employees = [], loading: loadingEmp } = useCollection(employeesQuery);
  const { data: leaveRequests = [], loading: loadingLeave } = useCollection(leaveRequestsQuery);
  const { data: hrQueries = [], loading: loadingQueries } = useCollection(hrQueriesQuery);

  const activeEmployees = employees.filter(e => e.status === 'Active').length;
  const onboarding = employees.filter(e => e.status === 'Onboarding').length;
  const pendingLeave = leaveRequests.filter(l => l.status === 'Pending').length;
  const openQueries = hrQueries.filter(q => q.status === 'Open').length;

  if (loadingEmp || loadingLeave || loadingQueries) {
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
          <h1 className="font-headline text-3xl font-bold tracking-tight">HR Dashboard</h1>
          <p className="text-muted-foreground">Manage your team and employee operations.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" asChild>
            <Link href="/hr/queries">
              <AlertCircle className="mr-2 h-4 w-4" />
              Check Queries
            </Link>
          </Button>
          <Button asChild>
            <Link href="/hr/employees">
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEmployees}</div>
            <p className="text-xs text-muted-foreground">Full-time employees</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onboarding</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onboarding}</div>
            <p className="text-xs text-muted-foreground">Joining this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Requests</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingLeave}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Queries</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openQueries}</div>
            <p className="text-xs text-muted-foreground">Open helpdesk tickets</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest HR events across the company.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaveRequests.length === 0 && onboarding === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">No recent activity logged.</p>
              )}
              {leaveRequests.slice(0, 3).map(leave => (
                <div key={leave.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{leave.employeeName} requested {leave.type} leave</p>
                    <p className="text-xs text-muted-foreground">{leave.startDate} to {leave.endDate}</p>
                  </div>
                  <Badge variant={leave.status === 'Approved' ? 'default' : 'outline'}>
                    {leave.status}
                  </Badge>
                </div>
              ))}
              {employees.filter(e => e.status === 'Onboarding').map(emp => (
                <div key={emp.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{emp.name} started onboarding</p>
                    <p className="text-xs text-muted-foreground">Joined {emp.joinDate}</p>
                  </div>
                  <Badge variant="secondary">Onboarding</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button variant="outline" className="justify-between" asChild>
              <Link href="/hr/induction">
                Setup Induction Checklist <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="justify-between" asChild>
              <Link href="/hr/leave">
                Approve Leave Requests <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="justify-between" asChild>
              <Link href="/hr/performance">
                Performance Ratings <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
