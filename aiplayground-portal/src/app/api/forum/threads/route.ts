import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { createThreadSchema } from "@/lib/validations/forum"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const moduleId = searchParams.get("moduleId")

    const where: Record<string, unknown> = {}
    if (moduleId === "general") {
      where.moduleId = null
    } else if (moduleId) {
      where.moduleId = moduleId
    }

    const threads = await prisma.forumThread.findMany({
      where,
      include: {
        user: { select: { id: true, name: true } },
        module: { select: { title: true, slug: true } },
        _count: { select: { posts: true } },
        posts: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
      },
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    })

    return NextResponse.json(threads)
  } catch (error) {
    console.error("Failed to fetch threads:", error)
    return NextResponse.json(
      { error: "Failed to fetch threads" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createThreadSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { title, moduleId, content } = parsed.data

    const thread = await prisma.$transaction(async (tx) => {
      const newThread = await tx.forumThread.create({
        data: {
          title,
          moduleId,
          userId: session.user.id,
        },
      })

      await tx.forumPost.create({
        data: {
          threadId: newThread.id,
          userId: session.user.id,
          content,
        },
      })

      return newThread
    })

    return NextResponse.json(thread, { status: 201 })
  } catch (error) {
    console.error("Failed to create thread:", error)
    return NextResponse.json(
      { error: "Failed to create thread" },
      { status: 500 }
    )
  }
}
