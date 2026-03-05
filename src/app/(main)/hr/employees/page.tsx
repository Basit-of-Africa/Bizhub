
"use client"

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, addDoc, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Mail, Building2, UserPlus, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function EmployeesPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const employeesQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'employees'), where('userId', '==', user.uid));
  }, [db, user]);

  const { data: employees = [], loading } = useCollection(employeesQuery);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => 
      e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.department?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [employees, searchQuery]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'Onboarding': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'On Leave': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const handleAddEmployee = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db || !user) return;

    const formData = new FormData(e.currentTarget);
    const newEmployee = {
      userId: user.uid,
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      department: formData.get('department') as string,
      email: formData.get('email') as string,
      status: 'Onboarding',
      joinDate: new Date().toISOString().split('T')[0],
    };

    addDoc(collection(db, 'employees'), newEmployee)
      .then(() => {
        toast({ title: "Success", description: "Employee added successfully." });
        setIsAdding(false);
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'employees',
          operation: 'create',
          requestResourceData: newEmployee
        }));
      });
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Employee Directory</h1>
          <p className="text-muted-foreground">Browse and manage all company members.</p>
        </div>
        
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" /> Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Employee</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" required placeholder="John Doe" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" name="role" required placeholder="Project Manager" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" name="department" required placeholder="Operations" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required placeholder="john@bizhub.com" />
              </div>
              <DialogFooter>
                <Button type="submit">Create Profile</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              className="pl-10" 
              placeholder="Search by name, role, or department..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredEmployees.map(employee => (
            <Card key={employee.id} className="overflow-hidden group hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border">
                    <AvatarFallback className="bg-primary/5 text-primary font-bold">
                      {employee.name?.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <CardTitle className="text-lg leading-none group-hover:text-primary transition-colors">
                      {employee.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{employee.role}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>{employee.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{employee.email}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-dashed">
                  <Badge variant="outline" className={getStatusColor(employee.status)}>
                    {employee.status}
                  </Badge>
                  <Button variant="ghost" size="sm" className="text-primary h-8 px-2">
                    Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredEmployees.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted-foreground border rounded-lg border-dashed">
              No team members found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
