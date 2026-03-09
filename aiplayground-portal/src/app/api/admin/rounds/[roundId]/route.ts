import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { updateRoundSchema } from "@/lib/validations/leaderboard"

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: { roundId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const round = await prisma.round.findUnique({
      where: { id: params.roundId },
      include: {
        memberships: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            team: { select: { id: true, name: true, color: true } },
          },
        },
        polls: {
          include: { _count: { select: { votes: true } } },
        },
      },
    })

    if (!round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 })
    }

    return NextResponse.json(round)
  } catch (error) {
    console.error("Failed to fetch round:", error)
    return NextResponse.json({ error: "Failed to fetch round" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { roundId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const parsed = updateRoundSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data: Record<string, unknown> = { ...parsed.data }
    if (parsed.data.startDate) data.startDate = new Date(parsed.data.startDate)
    if (parsed.data.endDate) data.endDate = new Date(parsed.data.endDate)

    const round = await prisma.round.update({
      where: { id: params.roundId },
      data,
    })

    return NextResponse.json(round)
  } catch (error) {
    console.error("Failed to update round:", error)
    return NextResponse.json({ error: "Failed to update round" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { roundId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.round.delete({ where: { id: params.roundId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete round:", error)
    return NextResponse.json({ error: "Failed to delete round" }, { status: 500 })
  }
}
