import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { bulkAssignMembershipsSchema } from "@/lib/validations/leaderboard"

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

    const memberships = await prisma.teamMembership.findMany({
      where: { roundId: params.roundId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        team: { select: { id: true, name: true, color: true } },
      },
      orderBy: { team: { name: "asc" } },
    })

    return NextResponse.json(memberships)
  } catch (error) {
    console.error("Failed to fetch memberships:", error)
    return NextResponse.json({ error: "Failed to fetch memberships" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { roundId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const parsed = bulkAssignMembershipsSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const round = await prisma.round.findUnique({ where: { id: params.roundId } })
    if (!round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 })
    }

    const created = await prisma.$transaction(
      parsed.data.memberships.map((m) =>
        prisma.teamMembership.upsert({
          where: {
            userId_roundId: { userId: m.userId, roundId: params.roundId },
          },
          update: { teamId: m.teamId, role: m.role || "MEMBER" },
          create: {
            teamId: m.teamId,
            userId: m.userId,
            roundId: params.roundId,
            role: m.role || "MEMBER",
          },
        })
      )
    )

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error("Failed to assign memberships:", error)
    return NextResponse.json({ error: "Failed to assign memberships" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { membershipId } = await request.json()
    if (!membershipId) {
      return NextResponse.json({ error: "membershipId required" }, { status: 400 })
    }

    await prisma.teamMembership.delete({ where: { id: membershipId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to remove membership:", error)
    return NextResponse.json({ error: "Failed to remove membership" }, { status: 500 })
  }
}
