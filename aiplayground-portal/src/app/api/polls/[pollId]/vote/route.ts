import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { castVoteSchema } from "@/lib/validations/leaderboard"

export async function POST(
  request: Request,
  { params }: { params: { pollId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = castVoteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // Verify poll exists and is active
    const poll = await prisma.poll.findUnique({
      where: { id: params.pollId },
    })
    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }
    if (!poll.isActive) {
      return NextResponse.json({ error: "Poll is not active" }, { status: 400 })
    }

    // Verify team exists
    const team = await prisma.team.findUnique({
      where: { id: parsed.data.teamId },
    })
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    // Upsert vote (allows changing vote)
    const vote = await prisma.vote.upsert({
      where: {
        pollId_userId: {
          pollId: params.pollId,
          userId: session.user.id,
        },
      },
      update: { teamId: parsed.data.teamId, votedAt: new Date() },
      create: {
        pollId: params.pollId,
        userId: session.user.id,
        teamId: parsed.data.teamId,
      },
    })

    return NextResponse.json(vote)
  } catch (error) {
    console.error("Failed to cast vote:", error)
    return NextResponse.json({ error: "Failed to cast vote" }, { status: 500 })
  }
}

export async function GET(
  _request: Request,
  { params }: { params: { pollId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const results = await prisma.vote.groupBy({
      by: ["teamId"],
      where: { pollId: params.pollId },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    })

    const teams = await prisma.team.findMany({
      where: { id: { in: results.map((r) => r.teamId) } },
      select: { id: true, name: true, color: true },
    })

    const teamMap = new Map(teams.map((t) => [t.id, t]))

    const pollResults = results.map((r) => ({
      team: teamMap.get(r.teamId),
      votes: r._count.id,
    }))

    return NextResponse.json(pollResults)
  } catch (error) {
    console.error("Failed to fetch poll results:", error)
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 })
  }
}
