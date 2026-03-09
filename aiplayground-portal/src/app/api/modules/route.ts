import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const modules = await prisma.module.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: { select: { resources: true } },
        progress: {
          where: { userId: session.user.id },
          take: 1,
        },
      },
    })

    const result = modules.map((mod) => ({
      ...mod,
      resourceCount: mod._count.resources,
      progress: mod.progress[0] ?? null,
      _count: undefined,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error("Failed to fetch modules:", error)
    return NextResponse.json(
      { error: "Failed to fetch modules" },
      { status: 500 }
    )
  }
}
