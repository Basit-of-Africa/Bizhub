
"use client"

import { useMemo } from 'react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, doc, updateDoc, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlaneLanding, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function LeavePage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const leaveRequestsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'leaveRequests'), where('userId', '==', user.uid));
  }, [db, user]);

  const { data: requests = [], loading } = useCollection(leaveRequestsQuery);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Approved': return 'default';
      case 'Pending': return 'secondary';
      case 'Rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const handleStatusUpdate = (id: string, newStatus: 'Approved' | 'Rejected') => {
    if (!db) return;
    const docRef = doc(db, 'leaveRequests', id);
    updateDoc(docRef, { status: newStatus })
      .then(() => {
        toast({
          title: `Request ${newStatus}`,
          description: `The leave request has been updated.`,
        });
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: { status: newStatus }
        }));
      });
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Leave Requests</h1>
          <p className="text-muted-foreground">Manage and approve employee time-off requests.</p>
        </div>
        <Button onClick={() => toast({ title: "Note", description: "Use the employee profile to submit new requests." })}>
          <PlaneLanding className="mr-2 h-4 w-4" /> New Request
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>History & Pending Approvals</CardTitle>
          <CardDescription>View all recent absence requests from the team.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No leave requests found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.employeeName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{request.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {request.startDate} <br />
                            <span className="text-xs text-muted-foreground">to {request.endDate}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(request.status)}>
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {request.status === 'Pending' && (
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 text-green-600 hover:bg-green-50"
                                onClick={() => handleStatusUpdate(request.id, 'Approved')}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                onClick={() => handleStatusUpdate(request.id, 'Rejected')}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
