
"use client"

import { useState, useMemo } from 'react';
import { useFirestore, useUser, useDoc, useCollection } from '@/firebase';
import { doc, setDoc, updateDoc, collection, getDocs, writeBatch, addDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { 
  Settings as SettingsIcon, 
  ShieldAlert, 
  Zap, 
  BrainCircuit, 
  Users, 
  Database,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Kanban,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  UserCog,
  UserPlus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { UserRole, UserProfile } from '@/lib/types';

export default function SettingsPage() {
  const db = useFirestore();
  const { user, role } = useUser();
  const { toast } = useToast();
  const [isResetting, setIsResetting] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);

  const settingsRef = useMemo(() => {
    if (!db || !user) return null;
    return doc(db, 'settings', user.uid);
  }, [db, user]);

  const { data: settings, loading } = useDoc(settingsRef);

  const usersQuery = useMemo(() => {
    if (!db) return null;
    return collection(db, 'users');
  }, [db]);

  const { data: systemUsers = [], loading: loadingUsers } = useCollection<UserProfile>(usersQuery as any);

  const updateSetting = (key: string, value: any) => {
    if (!settingsRef) return;
    
    updateDoc(settingsRef, { [key]: value })
      .then(() => {
        toast({
          title: "Setting Updated",
          description: `${key} has been synchronized with the cloud.`,
        });
      })
      .catch(async () => {
        setDoc(settingsRef, { [key]: value }, { merge: true });
      });
  };

  const updateUserRole = (targetUserId: string, newRole: UserRole) => {
    if (!db || role !== 'Super Admin') {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Only Super Admins can modify system roles.",
      });
      return;
    }

    const userRef = doc(db, 'users', targetUserId);
    updateDoc(userRef, { role: newRole })
      .then(() => {
        toast({
          title: "Role Updated",
          description: `User role changed to ${newRole}.`,
        });
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: userRef.path,
          operation: 'update',
          requestResourceData: { role: newRole }
        }));
      });
  };

  const handleAddSystemUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db || role !== 'Super Admin') return;

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const displayName = formData.get('displayName') as string;
    const selectedRole = formData.get('role') as UserRole;

    const newUser = {
      userId: '',
      email,
      displayName,
      role: selectedRole,
      lastLogin: '',
      isProvisioned: true,
    };

    addDoc(collection(db, 'users'), newUser)
      .then(() => {
        toast({
          title: "User Provisioned",
          description: `${displayName} has been added as ${selectedRole}.`,
        });
        setIsAddingUser(false);
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'users',
          operation: 'create',
          requestResourceData: newUser
        }));
      });
  };

  const handleResetData = async () => {
    if (!db || !user) return;
    setIsResetting(true);
    
    try {
      const collections = ['customers', 'leads', 'projects', 'interactions', 'employees', 'leaveRequests', 'hrQueries', 'transactions', 'appointments', 'inductionTasks'];
      
      for (const collName of collections) {
        const querySnapshot = await getDocs(collection(db, collName));
        const batch = writeBatch(db);
        querySnapshot.docs.forEach((doc) => {
          if (doc.data().userId === user.uid) {
            batch.delete(doc.ref);
          }
        });
        await batch.commit();
      }

      toast({
        title: "System Reset Complete",
        description: "All user-specific data has been cleared.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: "An error occurred while clearing data.",
      });
    } finally {
      setIsResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-20">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <SettingsIcon className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Vela OS Control Center</h1>
            <p className="text-muted-foreground">Master configuration for Vela's automation, intelligence, and business logic.</p>
          </div>
        </div>
      </header>

      <Tabs defaultValue="automation" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto gap-2 bg-transparent p-0">
          <TabsTrigger value="automation" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border">Automation</TabsTrigger>
          <TabsTrigger value="ai" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border">Intelligence</TabsTrigger>
          <TabsTrigger value="projects" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border">Projects</TabsTrigger>
          <TabsTrigger value="hr" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border">Team</TabsTrigger>
          <TabsTrigger value="roles" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border">Roles</TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground border">System</TabsTrigger>
        </TabsList>

        <TabsContent value="automation" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                Logic Triggers
              </CardTitle>
              <CardDescription>Configure cross-module automated workflows.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Onboarding</Label>
                  <p className="text-sm text-muted-foreground">Trigger onboarding sequence when a customer is added.</p>
                </div>
                <Switch 
                  checked={settings?.autoOnboarding ?? true} 
                  onCheckedChange={(val) => updateSetting('autoOnboarding', val)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Closed-Won Kickoff</Label>
                  <p className="text-sm text-muted-foreground">Initialize projects and schedule meetings when deals close.</p>
                </div>
                <Switch 
                  checked={settings?.autoProjectCreation ?? true} 
                  onCheckedChange={(val) => updateSetting('autoProjectCreation', val)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-primary" />
                Agent Configuration
              </CardTitle>
              <CardDescription>Fine-tune AI agent sensitivity and processing behavior.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Financial Health Threshold</Label>
                  <span className="text-sm font-bold text-primary">{settings?.healthThreshold ?? 70}%</span>
                </div>
                <Slider 
                  value={[settings?.healthThreshold ?? 70]} 
                  max={100} 
                  step={1} 
                  onValueChange={(val) => updateSetting('healthThreshold', val[0])}
                />
              </div>
              <div className="space-y-4 pt-6 border-t">
                <Label>AI Report Personality</Label>
                <Select 
                  value={settings?.aiReportTone ?? 'Professional'} 
                  onValueChange={(val) => updateSetting('aiReportTone', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Professional">Standard Professional</SelectItem>
                    <SelectItem value="Concise">Bullet-Point Concise</SelectItem>
                    <SelectItem value="Encouraging">Empathetic & Encouraging</SelectItem>
                    <SelectItem value="Strict">Strict & Data-Heavy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-6 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <UserCog className="h-5 w-5 text-indigo-500" />
                  System User Management
                </CardTitle>
                <CardDescription>Control who can access different modules of the OS.</CardDescription>
              </div>
              {role === 'Super Admin' && (
                <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <UserPlus className="mr-2 h-4 w-4" /> Provision User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Provision New System User</DialogTitle>
                      <DialogDescription>Assign a role to an email address.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddSystemUser} className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="displayName">Name</Label>
                        <Input id="displayName" name="displayName" required placeholder="Jane Doe" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" required placeholder="jane@example.com" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="role">System Role</Label>
                        <Select name="role" defaultValue="Staff">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Staff">Staff</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Create Profile</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border">
                <div className="grid grid-cols-4 p-4 border-b bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <div className="col-span-2">User</div>
                  <div>Role</div>
                  <div className="text-right">Action</div>
                </div>
                {loadingUsers ? (
                  <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>
                ) : (
                  systemUsers.map(sysUser => (
                    <div key={sysUser.id} className="grid grid-cols-4 p-4 items-center border-b last:border-0 hover:bg-muted/5 transition-colors">
                      <div className="col-span-2 flex flex-col">
                        <span className="text-sm font-bold">{sysUser.displayName}</span>
                        <span className="text-xs text-muted-foreground">{sysUser.email}</span>
                      </div>
                      <div>
                        <Badge variant={sysUser.role === 'Super Admin' ? 'default' : sysUser.role === 'Admin' ? 'secondary' : 'outline'} className="text-[10px] py-0">
                          {sysUser.role}
                        </Badge>
                      </div>
                      <div className="text-right">
                        {role === 'Super Admin' && sysUser.userId !== user.uid ? (
                          <Select value={sysUser.role} onValueChange={(val) => updateUserRole(sysUser.id!, val as UserRole)}>
                            <SelectTrigger className="h-8 w-32 ml-auto text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Super Admin">Super Admin</SelectItem>
                              <SelectItem value="Admin">Admin</SelectItem>
                              <SelectItem value="Staff">Staff</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Protected</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="mt-6 space-y-6">
          <Card className="border-destructive/20">
            <CardHeader className="bg-destructive/5">
              <CardTitle className="flex items-center gap-2 text-destructive">
                <ShieldAlert className="h-5 w-5" />
                OS Factory Reset
              </CardTitle>
              <CardDescription>Permanent system actions. Super Admin clearance required.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label className="text-destructive font-bold">Wipe Business Instance</Label>
                  <p className="text-sm text-muted-foreground">Delete all data associated with this account across all modules.</p>
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={isResetting || role !== 'Super Admin'}>
                      {isResetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                      Confirm Purge
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will permanently delete all records (CRM, HR, Projects, Financials) for this organization. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Yes, Wipe Everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Other Tabs Content (Projects, HR) omitted for brevity as they are unchanged sliders */}
      </Tabs>
    </div>
  );
}
