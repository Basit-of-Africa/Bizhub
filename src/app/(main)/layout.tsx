
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useUser, useAuth } from "@/firebase"
import { signOut } from "firebase/auth"

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { Logo } from "@/components/icons"
import { ModeToggle } from "@/components/mode-toggle"
import {
  LayoutDashboard,
  ArrowLeftRight,
  Calendar,
  BrainCircuit,
  Settings,
  Users,
  PlaneLanding,
  MessageSquare,
  GraduationCap,
  Briefcase,
  Contact,
  TrendingUp,
  CircleDollarSign,
  LogOut,
  Loader2,
  Kanban,
  ShieldCheck,
  BarChart3,
  Globe,
  Building2
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, role, loading } = useUser()
  const auth = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (!loading && user && !user.setupCompleted && user.uid !== 'demo-tenant-owner') {
      router.push("/onboarding")
    }
  }, [user, loading, router])

  const handleSignOut = () => {
    if (auth) {
      signOut(auth).then(() => router.push("/login"))
    }
  }

  const sections = [
    {
      label: "Operations",
      roles: ["Super Admin", "Admin", "Staff"],
      items: [
        { href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" />, label: "Command Center" },
        { href: "/transactions", icon: <ArrowLeftRight className="h-4 w-4" />, label: "Ledger" },
        { href: "/projects", icon: <Kanban className="h-4 w-4" />, label: "Projects" },
        { href: "/schedule", icon: <Calendar className="h-4 w-4" />, label: "Schedule" },
        { href: "/predictive-insights", icon: <BrainCircuit className="h-4 w-4" />, label: "Forecasts" },
        { href: "/analytics", icon: <BarChart3 className="h-4 w-4" />, label: "Analytics", roles: ["Super Admin", "Admin"] },
      ].filter(item => !item.roles || item.roles.includes(role))
    },
    {
      label: "Sales & CRM",
      roles: ["Super Admin", "Admin", "Staff"],
      items: [
        { href: "/crm/dashboard", icon: <CircleDollarSign className="h-4 w-4" />, label: "Sales Hub" },
        { href: "/crm/customers", icon: <Contact className="h-4 w-4" />, label: "Client CRM" },
        { href: "/crm/pipeline", icon: <TrendingUp className="h-4 w-4" />, label: "Pipeline" },
      ]
    },
    {
      label: "Human Resources",
      roles: ["Super Admin", "Admin"],
      items: [
        { href: "/hr/dashboard", icon: <Briefcase className="h-4 w-4" />, label: "HR Console" },
        { href: "/hr/employees", icon: <Users className="h-4 w-4" />, label: "Team" },
        { href: "/hr/leave", icon: <PlaneLanding className="h-4 w-4" />, label: "Time Off" },
        { href: "/hr/queries", icon: <MessageSquare className="h-4 w-4" />, label: "Support" },
        { href: "/hr/training", icon: <GraduationCap className="h-4 w-4" />, label: "Academy" },
      ]
    }
  ]

  const filteredSections = sections.filter(section => section.roles.includes(role))

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-2">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Logo className="text-primary h-6 w-6" />
              <span className="font-headline text-xl font-extrabold tracking-tighter">vela</span>
            </Link>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
             <div className="px-2 py-2 mb-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 border rounded-lg">
                   <div className="p-2 bg-primary rounded-md">
                      <Building2 className="h-4 w-4 text-primary-foreground" />
                   </div>
                   <div className="overflow-hidden">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground truncate">Organization</p>
                      <p className="text-sm font-bold truncate">{user?.businessName || "Acme Corp"}</p>
                   </div>
                </div>
             </div>
          </SidebarGroup>
          {filteredSections.map((section) => (
            <SidebarGroup key={section.label}>
              <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
             <SidebarMenuItem className="px-2 mb-2">
                <div className="flex items-center gap-2 p-2 bg-primary/5 border border-primary/20 rounded-md">
                   <Globe className="h-3 w-3 text-primary" />
                   <span className="text-[10px] font-bold uppercase tracking-tighter truncate">
                     Instance: {user?.uid.slice(0, 8)}...
                   </span>
                </div>
             </SidebarMenuItem>
            {["Super Admin", "Admin"].includes(role) && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings" isActive={pathname === "/settings"}>
                  <Link href="/settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            <SidebarMenuItem>
              <div className="flex flex-col gap-2 p-2 border rounded-lg bg-muted/20 mx-2 mb-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.photoURL || undefined} />
                    <AvatarFallback>{user?.displayName?.[0] || user?.email?.[0] || 'V'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">{user?.displayName || "User"}</p>
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-primary" />
                      <span className="text-[10px] font-bold text-primary uppercase">{role}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="md:hidden" />
            <Badge variant="outline" className="hidden sm:flex border-primary/20 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest px-2 py-0">
              {role} Clearance
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
