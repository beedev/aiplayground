import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { updateResourceSchema } from "@/lib/validations/resource"

export const dynamic = 'force-dynamic'

export async function PUT(
  request: Request,
  { params }: { params: { slug: string; resourceId: string } }
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
    const parsed = updateResourceSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const resource = await prisma.moduleResource.update({
      where: { id: params.resourceId },
      data: parsed.data,
    })

    return NextResponse.json(resource)
  } catch (error) {
    console.error("Failed to update resource:", error)
    return NextResponse.json(
      { error: "Failed to update resource" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { slug: string; resourceId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.moduleResource.delete({
      where: { id: params.resourceId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete resource:", error)
    return NextResponse.json(
      { error: "Failed to delete resource" },
      { status: 500 }
    )
  }
}
