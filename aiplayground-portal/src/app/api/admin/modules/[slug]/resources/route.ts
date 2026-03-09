import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { createResourceSchema } from "@/lib/validations/resource"

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
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const trainingModule = await prisma.module.findUnique({
      where: { slug: params.slug },
      include: {
        resources: { orderBy: { order: "asc" } },
      },
    })

    if (!trainingModule) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 })
    }

    return NextResponse.json(trainingModule.resources)
  } catch (error) {
    console.error("Failed to fetch resources:", error)
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const parsed = createResourceSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const trainingModule = await prisma.module.findUnique({
      where: { slug: params.slug },
    })

    if (!trainingModule) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 })
    }

    const resource = await prisma.moduleResource.create({
      data: {
        ...parsed.data,
        moduleId: trainingModule.id,
      },
    })

    return NextResponse.json(resource, { status: 201 })
  } catch (error) {
    console.error("Failed to create resource:", error)
    return NextResponse.json(
      { error: "Failed to create resource" },
      { status: 500 }
    )
  }
}
