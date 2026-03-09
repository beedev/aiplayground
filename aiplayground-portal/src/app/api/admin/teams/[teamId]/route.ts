import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { updateTeamSchema } from "@/lib/validations/leaderboard"

export const dynamic = 'force-dynamic'

export async function PUT(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const parsed = updateTeamSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const team = await prisma.team.update({
      where: { id: params.teamId },
      data: parsed.data,
    })

    return NextResponse.json(team)
  } catch (error) {
    console.error("Failed to update team:", error)
    return NextResponse.json({ error: "Failed to update team" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.team.delete({ where: { id: params.teamId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete team:", error)
    return NextResponse.json({ error: "Failed to delete team" }, { status: 500 })
  }
}
