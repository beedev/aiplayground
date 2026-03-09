import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function PATCH(
  _request: Request,
  { params }: { params: { threadId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const thread = await prisma.forumThread.findUnique({
      where: { id: params.threadId },
    })

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 })
    }

    const updated = await prisma.forumThread.update({
      where: { id: params.threadId },
      data: { pinned: !thread.pinned },
    })

    return NextResponse.json({ pinned: updated.pinned })
  } catch (error) {
    console.error("Failed to toggle pin:", error)
    return NextResponse.json(
      { error: "Failed to toggle pin" },
      { status: 500 }
    )
  }
}
