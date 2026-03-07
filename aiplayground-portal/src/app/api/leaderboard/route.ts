import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const roundId = searchParams.get("roundId")

    // Get active or specified round
    let round
    if (roundId) {
      round = await prisma.round.findUnique({ where: { id: roundId } })
    } else {
      round = await prisma.round.findFirst({
        where: { status: "ACTIVE" },
        orderBy: { startDate: "desc" },
      })
      if (!round) {
        round = await prisma.round.findFirst({
          orderBy: { startDate: "desc" },
        })
      }
    }

    if (!round) {
      return NextResponse.json({
        round: null,
        teams: [],
        rounds: [],
        activePoll: null,
        userVote: null,
      })
    }

    // Get all rounds for the selector
    const rounds = await prisma.round.findMany({
      orderBy: { startDate: "desc" },
      select: { id: true, name: true, status: true },
    })

    // Get teams with vote counts for this round
    const teams = await prisma.team.findMany({
      include: {
        memberships: {
          where: { roundId: round.id },
          include: {
            user: { select: { id: true, name: true } },
          },
        },
        votes: {
          where: {
            poll: { roundId: round.id },
          },
        },
      },
    })

    // Compute rankings
    const teamRankings = teams
      .map((team) => ({
        id: team.id,
        name: team.name,
        color: team.color,
        description: team.description,
        voteCount: team.votes.length,
        members: team.memberships.map((m) => ({
          id: m.user.id,
          name: m.user.name,
          role: m.role,
        })),
      }))
      .sort((a, b) => b.voteCount - a.voteCount)
      .map((team, index) => ({ ...team, rank: index + 1 }))

    // Get active poll for this round
    const activePoll = await prisma.poll.findFirst({
      where: { roundId: round.id, isActive: true },
      include: { _count: { select: { votes: true } } },
    })

    // Get user's vote for the active poll
    let userVote = null
    if (activePoll) {
      userVote = await prisma.vote.findUnique({
        where: {
          pollId_userId: {
            pollId: activePoll.id,
            userId: session.user.id,
          },
        },
        select: { teamId: true },
      })
    }

    return NextResponse.json({
      round: { id: round.id, name: round.name, status: round.status },
      teams: teamRankings,
      rounds,
      activePoll: activePoll
        ? {
            id: activePoll.id,
            title: activePoll.title,
            description: activePoll.description,
            totalVotes: activePoll._count.votes,
          }
        : null,
      userVote: userVote?.teamId ?? null,
    })
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error)
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    )
  }
}
