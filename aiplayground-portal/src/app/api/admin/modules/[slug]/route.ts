import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { updateModuleSchema } from "@/lib/validations/module"

export const dynamic = 'force-dynamic'

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const parsed = updateModuleSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const existing = await prisma.module.findUnique({
      where: { slug: params.slug },
    })

    if (!existing) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 })
    }

    const updated = await prisma.module.update({
      where: { slug: params.slug },
      data: parsed.data,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Failed to update module:", error)
    return NextResponse.json(
      { error: "Failed to update module" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const existing = await prisma.module.findUnique({
      where: { slug: params.slug },
      include: {
        _count: {
          select: { progress: true, forumThreads: true, resources: true },
        },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 })
    }

    await prisma.module.delete({
      where: { slug: params.slug },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete module:", error)
    return NextResponse.json(
      { error: "Failed to delete module" },
      { status: 500 }
    )
  }
}
