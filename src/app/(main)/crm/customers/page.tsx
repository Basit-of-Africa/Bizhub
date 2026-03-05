
"use client"

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, addDoc, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Mail, 
  Phone, 
  Plus, 
  MoreHorizontal,
  ExternalLink,
  Loader2
} from 'lucide-react';
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

export default function CustomersPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const customersQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'customers'), where('userId', '==', user.uid));
  }, [db, user]);

  const { data: customers = [], loading } = useCollection(customersQuery);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [customers, searchQuery]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const handleAddCustomer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db || !user) return;

    const formData = new FormData(e.currentTarget);
    const newCustomer = {
      userId: user.uid,
      name: formData.get('name') as string,
      company: formData.get('company') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      status: 'Active',
      totalValue: 0,
      lastContact: new Date().toISOString(),
    };

    addDoc(collection(db, 'customers'), newCustomer)
      .then(() => {
        toast({ title: "Success", description: "Customer added successfully." });
        setIsAdding(false);
      })
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'customers',
          operation: 'create',
          requestResourceData: newCustomer
        }));
      });
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Customer Directory</h1>
          <p className="text-muted-foreground">Manage your client relationships and contact data.</p>
        </div>
        
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Customer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" required placeholder="Jane Smith" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" name="company" placeholder="Acme Inc." />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required placeholder="jane@example.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" placeholder="555-0123" />
              </div>
              <DialogFooter>
                <Button type="submit">Create Customer</Button>
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
              placeholder="Search by name, company, or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.map(customer => (
            <Card key={customer.id} className="group hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10 border">
                    <AvatarFallback className="bg-primary/5 text-primary font-bold">
                      {customer.name?.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <CardTitle className="text-lg leading-none group-hover:text-primary transition-colors">
                      {customer.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{customer.company}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{customer.phone || 'No phone'}</span>
                  </div>
                </div>
                
                <div className="pt-2 flex items-center justify-between border-t border-dashed">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Lifetime Value</p>
                    <p className="text-sm font-bold text-foreground">{formatCurrency(customer.totalValue)}</p>
                  </div>
                  <Badge variant={customer.status === 'Active' ? 'default' : 'secondary'}>
                    {customer.status}
                  </Badge>
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="mr-2 h-3 w-3" />
                  View Customer Profile
                </Button>
              </CardContent>
            </Card>
          ))}
          {filteredCustomers.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No customers found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
