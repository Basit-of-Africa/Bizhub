
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
  UserCircle,
  Settings,
  Users,
  UserPlus,
  PlaneLanding,
  Star,
  MessageSquare,
  GraduationCap,
  Briefcase,
  Contact,
  TrendingUp,
  CircleDollarSign,
  LogOut,
  Loader2
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, loading } = useUser()
  const auth = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  const handleSignOut = () => {
    if (auth) {
      signOut(auth).then(() => router.push("/login"))
    }
  }

  const mainNav = [
    { href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" />, label: "Dashboard" },
    { href: "/transactions", icon: <ArrowLeftRight className="h-4 w-4" />, label: "Transactions" },
    { href: "/schedule", icon: <Calendar className="h-4 w-4" />, label: "Schedule" },
    { href: "/predictive-insights", icon: <BrainCircuit className="h-4 w-4" />, label: "Insights" },
  ]

  const crmNav = [
    { href: "/crm/dashboard", icon: <CircleDollarSign className="h-4 w-4" />, label: "CRM Overview" },
    { href: "/crm/customers", icon: <Contact className="h-4 w-4" />, label: "Customers" },
    { href: "/crm/pipeline", icon: <TrendingUp className="h-4 w-4" />, label: "Sales Pipeline" },
  ]

  const hrNav = [
    { href: "/hr/dashboard", icon: <Briefcase className="h-4 w-4" />, label: "HR Dashboard" },
    { href: "/hr/employees", icon: <Users className="h-4 w-4" />, label: "Directory" },
    { href: "/hr/induction", icon: <UserPlus className="h-4 w-4" />, label: "Induction" },
    { href: "/hr/leave", icon: <PlaneLanding className="h-4 w-4" />, label: "Leave Requests" },
    { href: "/hr/performance", icon: <Star className="h-4 w-4" />, label: "Performance" },
    { href: "/hr/queries", icon: <MessageSquare className="h-4 w-4" />, label: "Helpdesk" },
    { href: "/hr/training", icon: <GraduationCap className="h-4 w-4" />, label: "Training" },
  ]

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-2">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Logo className="text-primary h-6 w-6" />
              <span className="font-headline text-lg font-bold tracking-tight">BizHub</span>
            </Link>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Operations</SidebarGroupLabel>
            <SidebarMenu>
              {mainNav.map((item) => (
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

          <SidebarGroup>
            <SidebarGroupLabel>Sales & CRM</SidebarGroupLabel>
            <SidebarMenu>
              {crmNav.map((item) => (
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

          <SidebarGroup>
            <SidebarGroupLabel>Team Management</SidebarGroupLabel>
            <SidebarMenu>
              {hrNav.map((item) => (
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
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Settings">
                <Link href="#">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <div className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback>{user.displayName?.[0] || user.email?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate">{user.displayName || "User"}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="md:hidden" />
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
