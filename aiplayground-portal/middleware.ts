import { auth } from "@/lib/auth"
import { stripBasePath, withBasePath } from "@/lib/paths"
import { NextResponse } from "next/server"

export default auth((req) => {
  const pathname = stripBasePath(req.nextUrl.pathname)
  const isLoggedIn = !!req.auth

  if (
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/images")
  ) {
    return NextResponse.next()
  }

  // Public routes
  if (pathname === "/login" || pathname.startsWith("/api/auth")) {
    if (isLoggedIn && pathname === "/login") {
      return NextResponse.redirect(new URL(withBasePath("/dashboard"), req.url))
    }
    return NextResponse.next()
  }

  // Require auth for everything else
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL(withBasePath("/login"), req.url))
  }

  // Admin routes require ADMIN role
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (req.auth?.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL(withBasePath("/dashboard"), req.url))
    }
  }

  // Guest users can only access modules
  if (req.auth?.user?.role === "GUEST") {
    const allowed =
      pathname.startsWith("/modules") || pathname.startsWith("/api/modules")
    if (!allowed) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      return NextResponse.redirect(new URL(withBasePath("/modules"), req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images).*)"],
}
