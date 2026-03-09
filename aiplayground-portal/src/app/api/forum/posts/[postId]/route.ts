import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function DELETE(
  _request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.forumPost.delete({
      where: { id: params.postId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete post:", error)
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    )
  }
}
