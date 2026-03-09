import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { createPostSchema } from "@/lib/validations/forum"

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  { params }: { params: { threadId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createPostSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const thread = await prisma.forumThread.findUnique({
      where: { id: params.threadId },
    })

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 })
    }

    const post = await prisma.forumPost.create({
      data: {
        threadId: params.threadId,
        userId: session.user.id,
        content: parsed.data.content,
        parentId: parsed.data.parentId ?? null,
      },
    })

    await prisma.forumThread.update({
      where: { id: params.threadId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error("Failed to create post:", error)
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    )
  }
}
