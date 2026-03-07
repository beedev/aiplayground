import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { updatePollSchema } from "@/lib/validations/leaderboard"

export async function PUT(
  request: Request,
  { params }: { params: { pollId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const parsed = updatePollSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data: Record<string, unknown> = { ...parsed.data }

    // If closing the poll, set closedAt
    if (parsed.data.isActive === false) {
      data.closedAt = new Date()
    }

    const poll = await prisma.poll.update({
      where: { id: params.pollId },
      data,
    })

    return NextResponse.json(poll)
  } catch (error) {
    console.error("Failed to update poll:", error)
    return NextResponse.json({ error: "Failed to update poll" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { pollId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.poll.delete({ where: { id: params.pollId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete poll:", error)
    return NextResponse.json({ error: "Failed to delete poll" }, { status: 500 })
  }
}
