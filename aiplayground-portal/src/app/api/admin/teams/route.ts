import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { createTeamSchema } from "@/lib/validations/leaderboard"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const teams = await prisma.team.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { memberships: true, votes: true } },
      },
    })

    return NextResponse.json(teams)
  } catch (error) {
    console.error("Failed to fetch teams:", error)
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const parsed = createTeamSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const existing = await prisma.team.findUnique({
      where: { name: parsed.data.name },
    })
    if (existing) {
      return NextResponse.json({ error: "Team name already exists" }, { status: 409 })
    }

    const team = await prisma.team.create({ data: parsed.data })
    return NextResponse.json(team, { status: 201 })
  } catch (error) {
    console.error("Failed to create team:", error)
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 })
  }
}
