"use client"

import { useEffect } from "react"
import { SessionProvider } from "next-auth/react"
import { withBasePath } from "@/lib/paths"

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const originalFetch = window.fetch.bind(window)

    window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      if (typeof input === "string" && input.startsWith("/api")) {
        return originalFetch(withBasePath(input), init)
      }

      return originalFetch(input, init)
    }) as typeof window.fetch

    return () => {
      window.fetch = originalFetch
    }
  }, [])

  return (
    <SessionProvider basePath={withBasePath("/api/auth")}>
      {children}
    </SessionProvider>
  )
}
