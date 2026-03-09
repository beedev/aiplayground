"use client"

import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { stripBasePath, withBasePath } from "@/lib/paths"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { LogOut } from "lucide-react"

interface HeaderProps {
  userName: string
  userEmail: string
  userRole: string
}

function getPageTitle(pathname: string): string {
  if (pathname === "/dashboard") return "Dashboard"
  if (pathname === "/forum") return "Forum"
  if (pathname.startsWith("/forum/")) return "Thread"
  if (pathname.match(/^\/modules\/[^/]+$/)) return "Module"
  if (pathname === "/modules") return "Modules"
  if (pathname === "/admin") return "Admin Dashboard"
  if (pathname === "/admin/users") return "User Management"
  if (pathname === "/admin/modules") return "Module Resources"
  if (pathname === "/admin/forum") return "Forum Moderation"
  if (pathname === "/admin/analytics") return "Analytics"
  return "AIPlayground"
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function Header({ userName, userEmail, userRole }: HeaderProps) {
  const pathname = stripBasePath(usePathname() ?? "/")
  const title = getPageTitle(pathname)

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="pl-12 lg:pl-0">
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-medium">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:block text-sm font-medium text-gray-700">
              {userName}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
                <Badge
                  variant={userRole === "ADMIN" ? "default" : "secondary"}
                  className="w-fit text-xs mt-1"
                >
                  {userRole}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: withBasePath("/login") })}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
