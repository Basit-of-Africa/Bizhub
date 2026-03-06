
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
  ShieldCheck
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, role, loading } = useUser()
  const auth = useAuth()
  const router = useRouter()

  const handleSignOut = () => {
    if (auth) {
      signOut(auth).then(() => router.push("/login"))
    }
  }

  // Define navigation sections with role requirements
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
      ]
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
