import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { completed } = body

    if (typeof completed !== "boolean") {
      return NextResponse.json(
        { error: "completed must be a boolean" },
        { status: 400 }
      )
    }

    const trainingModule = await prisma.module.findUnique({
      where: { slug: params.slug },
    })

    if (!trainingModule) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 })
    }

    const progress = await prisma.userProgress.upsert({
      where: {
        userId_moduleId: {
          userId: session.user.id,
          moduleId: trainingModule.id,
        },
      },
      update: {
        completed,
        completedAt: completed ? new Date() : null,
      },
      create: {
        userId: session.user.id,
        moduleId: trainingModule.id,
        completed,
        completedAt: completed ? new Date() : null,
      },
    })

    return NextResponse.json(progress)
  } catch (error) {
    console.error("Failed to update progress:", error)
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    )
  }
}
