import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getModuleContent } from "@/lib/markdown"

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const trainingModule = await prisma.module.findUnique({
      where: { slug: params.slug },
      include: {
        resources: { orderBy: { order: "asc" } },
        progress: {
          where: { userId: session.user.id },
          take: 1,
        },
      },
    })

    if (!trainingModule) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 })
    }

    const content = getModuleContent(trainingModule.contentFilePath)

    return NextResponse.json({
      trainingModule,
      content,
      resources: trainingModule.resources,
      progress: trainingModule.progress[0] ?? null,
    })
  } catch (error) {
    console.error("Failed to fetch module:", error)
    return NextResponse.json(
      { error: "Failed to fetch module" },
      { status: 500 }
    )
  }
}
