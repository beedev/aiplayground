import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { createPollSchema } from "@/lib/validations/leaderboard"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const polls = await prisma.poll.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        round: { select: { id: true, name: true } },
        _count: { select: { votes: true } },
      },
    })

    return NextResponse.json(polls)
  } catch (error) {
    console.error("Failed to fetch polls:", error)
    return NextResponse.json({ error: "Failed to fetch polls" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const parsed = createPollSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const round = await prisma.round.findUnique({
      where: { id: parsed.data.roundId },
    })
    if (!round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 })
    }

    const poll = await prisma.poll.create({ data: parsed.data })
    return NextResponse.json(poll, { status: 201 })
  } catch (error) {
    console.error("Failed to create poll:", error)
    return NextResponse.json({ error: "Failed to create poll" }, { status: 500 })
  }
}
