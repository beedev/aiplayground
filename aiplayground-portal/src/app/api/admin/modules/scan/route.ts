import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { scanUnregisteredModules } from "@/lib/markdown"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const unregistered = await scanUnregisteredModules()
    return NextResponse.json(unregistered)
  } catch (error) {
    console.error("Failed to scan modules:", error)
    return NextResponse.json(
      { error: "Failed to scan for new modules" },
      { status: 500 }
    )
  }
}
