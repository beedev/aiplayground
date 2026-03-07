"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { stripBasePath } from "@/lib/paths"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  Users,
  BarChart3,
  Shield,
  BrainCircuit,
  Menu,
  FolderOpen,
  Settings,
  Trophy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"
import { useState } from "react"

interface SidebarProps {
  userName: string
  userRole: string
}

const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/modules", label: "Modules", icon: BookOpen },
  { href: "/forum", label: "Forum", icon: MessageSquare },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
]

const adminNavItems = [
  { href: "/admin", label: "Admin Home", icon: Shield },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/modules", label: "Module Resources", icon: FolderOpen },
  { href: "/admin/forum", label: "Forum Moderation", icon: Settings },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/leaderboard", label: "Leaderboard", icon: Trophy },
]

function NavContent({ userRole, pathname }: { userRole: string; pathname: string }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <BrainCircuit className="h-7 w-7 text-indigo-600" />
        <span className="text-lg font-bold tracking-tight">AIPlayground</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {mainNavItems.map((item) => {
          const isActive =
            item.href === "/modules"
              ? pathname.startsWith("/modules")
              : pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}

        {userRole === "ADMIN" && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Administration
              </p>
            </div>
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </>
        )}
      </nav>
    </div>
  )
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = stripBasePath(usePathname())
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col border-r bg-white">
        <NavContent userRole={userRole} pathname={pathname} />
      </aside>

      {/* Mobile sidebar */}
      <div className="lg:hidden fixed top-0 left-0 z-40 p-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-white">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div onClick={() => setOpen(false)}>
              <NavContent userRole={userRole} pathname={pathname} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
