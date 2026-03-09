import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { createRoundSchema } from "@/lib/validations/leaderboard"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const rounds = await prisma.round.findMany({
      orderBy: { startDate: "desc" },
      include: {
        _count: { select: { memberships: true, polls: true } },
      },
    })

    return NextResponse.json(rounds)
  } catch (error) {
    console.error("Failed to fetch rounds:", error)
    return NextResponse.json({ error: "Failed to fetch rounds" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const parsed = createRoundSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const round = await prisma.round.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
      },
    })

    return NextResponse.json(round, { status: 201 })
  } catch (error) {
    console.error("Failed to create round:", error)
    return NextResponse.json({ error: "Failed to create round" }, { status: 500 })
  }
}
