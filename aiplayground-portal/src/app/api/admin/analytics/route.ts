import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const [
      modules,
      totalActiveUsers,
      completionsByModule,
      users,
      userCompletions,
      userLastActivities,
      totalThreads,
      totalPosts,
      postsThisWeek,
      topContributors,
      recentCompletions,
      recentPosts,
    ] = await Promise.all([
      // All modules
      prisma.module.findMany({
        select: { id: true, title: true },
        orderBy: { order: "asc" },
      }),

      // Total active users
      prisma.user.count({ where: { isActive: true } }),

      // Completions grouped by module
      prisma.userProgress.groupBy({
        by: ["moduleId"],
        where: { completed: true },
        _count: { userId: true },
      }),

      // All active users for progress tracking
      prisma.user.findMany({
        where: { isActive: true },
        select: { id: true, name: true, email: true },
      }),

      // User completions grouped by user
      prisma.userProgress.groupBy({
        by: ["userId"],
        where: { completed: true },
        _count: { moduleId: true },
      }),

      // Last activity per user (latest completion date)
      prisma.userProgress.groupBy({
        by: ["userId"],
        _max: { completedAt: true },
      }),

      // Forum: total threads
      prisma.forumThread.count(),

      // Forum: total posts
      prisma.forumPost.count(),

      // Forum: posts this week
      prisma.forumPost.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Forum: top 5 contributors
      prisma.forumPost.groupBy({
        by: ["userId"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      }),

      // Engagement: completions last 30 days
      prisma.userProgress.findMany({
        where: {
          completed: true,
          completedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        select: { completedAt: true },
      }),

      // Engagement: posts last 30 days
      prisma.forumPost.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        select: { createdAt: true },
      }),
    ])

    // Build module completion data
    const completionMap = new Map(
      completionsByModule.map((c) => [c.moduleId, c._count.userId])
    )
    const moduleCompletion = modules.map((mod) => ({
      moduleId: mod.id,
      title: mod.title,
      completedCount: completionMap.get(mod.id) ?? 0,
      totalUsers: totalActiveUsers,
    }))

    // Build user progress data
    const totalModules = modules.length
    const completionsByUser = new Map(
      userCompletions.map((c) => [c.userId, c._count.moduleId])
    )
    const lastActivityByUser = new Map(
      userLastActivities.map((a) => [a.userId, a._max.completedAt])
    )
    const userProgress = users.map((user) => ({
      userId: user.id,
      name: user.name,
      email: user.email,
      completedModules: completionsByUser.get(user.id) ?? 0,
      totalModules,
      lastActivity: lastActivityByUser.get(user.id) ?? null,
    }))

    // Resolve top contributor names
    const contributorUserIds = topContributors.map((c) => c.userId)
    const contributorUsers = await prisma.user.findMany({
      where: { id: { in: contributorUserIds } },
      select: { id: true, name: true },
    })
    const contributorNameMap = new Map(
      contributorUsers.map((u) => [u.id, u.name])
    )
    const forumActivity = {
      totalThreads,
      totalPosts,
      postsThisWeek,
      topContributors: topContributors.map((c) => ({
        name: contributorNameMap.get(c.userId) ?? "Unknown",
        postCount: c._count.id,
      })),
    }

    // Build engagement trends (last 30 days, per day)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const dayMap = new Map<string, { completions: number; posts: number }>()

    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000)
      const key = date.toISOString().split("T")[0]
      dayMap.set(key, { completions: 0, posts: 0 })
    }

    for (const completion of recentCompletions) {
      if (completion.completedAt) {
        const key = completion.completedAt.toISOString().split("T")[0]
        const entry = dayMap.get(key)
        if (entry) entry.completions++
      }
    }

    for (const post of recentPosts) {
      const key = post.createdAt.toISOString().split("T")[0]
      const entry = dayMap.get(key)
      if (entry) entry.posts++
    }

    const engagementTrends = Array.from(dayMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        completions: data.completions,
        posts: data.posts,
      }))

    return NextResponse.json({
      moduleCompletion,
      userProgress,
      forumActivity,
      engagementTrends,
    })
  } catch (error) {
    console.error("Failed to fetch analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
