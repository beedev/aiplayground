import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function POST(
  _request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existing = await prisma.postUpvote.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: params.postId,
        },
      },
    })

    if (existing) {
      await prisma.postUpvote.delete({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId: params.postId,
          },
        },
      })
    } else {
      await prisma.postUpvote.create({
        data: {
          userId: session.user.id,
          postId: params.postId,
        },
      })
    }

    const count = await prisma.postUpvote.count({
      where: { postId: params.postId },
    })

    return NextResponse.json({ upvoted: !existing, count })
  } catch (error) {
    console.error("Failed to toggle upvote:", error)
    return NextResponse.json(
      { error: "Failed to toggle upvote" },
      { status: 500 }
    )
  }
}
