import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"

const ingestModuleSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  description: z.string().min(1),
  order: z.number().int().min(1),
  contentFilePath: z.string().min(1),
})

const ingestModulesSchema = z.object({
  modules: z.array(ingestModuleSchema).min(1),
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const parsed = ingestModulesSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // Check for slug conflicts
    const slugs = parsed.data.modules.map(m => m.slug)
    const existing = await prisma.module.findMany({
      where: { slug: { in: slugs } },
      select: { slug: true },
    })
    if (existing.length > 0) {
      return NextResponse.json(
        { error: `Slugs already exist: ${existing.map(e => e.slug).join(", ")}` },
        { status: 409 }
      )
    }

    const created = await prisma.$transaction(
      parsed.data.modules.map(mod =>
        prisma.module.create({ data: mod })
      )
    )

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error("Failed to ingest modules:", error)
    return NextResponse.json(
      { error: "Failed to ingest modules" },
      { status: 500 }
    )
  }
}
