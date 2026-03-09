import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { createModuleSchema, reorderModulesSchema } from "@/lib/validations/module"

export const dynamic = 'force-dynamic'

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
    const parsed = createModuleSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const existing = await prisma.module.findUnique({
      where: { slug: parsed.data.slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: "A module with this slug already exists" },
        { status: 409 }
      )
    }

    const trainingModule = await prisma.module.create({
      data: parsed.data,
    })

    return NextResponse.json(trainingModule, { status: 201 })
  } catch (error) {
    console.error("Failed to create module:", error)
    return NextResponse.json(
      { error: "Failed to create module" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const parsed = reorderModulesSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    await prisma.$transaction(
      parsed.data.modules.map((mod) =>
        prisma.module.update({
          where: { id: mod.id },
          data: { order: mod.order },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to reorder modules:", error)
    return NextResponse.json(
      { error: "Failed to reorder modules" },
      { status: 500 }
    )
  }
}
