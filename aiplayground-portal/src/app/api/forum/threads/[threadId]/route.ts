import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: { threadId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const thread = await prisma.forumThread.findUnique({
      where: { id: params.threadId },
      include: {
        user: { select: { id: true, name: true } },
        module: { select: { title: true, slug: true } },
        posts: {
          where: { parentId: null },
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { id: true, name: true } },
            _count: { select: { upvotes: true } },
            upvotes: {
              where: { userId: session.user.id },
              select: { userId: true },
            },
            replies: {
              orderBy: { createdAt: "asc" },
              include: {
                user: { select: { id: true, name: true } },
                _count: { select: { upvotes: true } },
                upvotes: {
                  where: { userId: session.user.id },
                  select: { userId: true },
                },
                replies: {
                  orderBy: { createdAt: "asc" },
                  include: {
                    user: { select: { id: true, name: true } },
                    _count: { select: { upvotes: true } },
                    upvotes: {
                      where: { userId: session.user.id },
                      select: { userId: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 })
    }

    return NextResponse.json(thread)
  } catch (error) {
    console.error("Failed to fetch thread:", error)
    return NextResponse.json(
      { error: "Failed to fetch thread" },
      { status: 500 }
    )
  }
}
