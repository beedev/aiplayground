import { prisma } from "@/lib/prisma"
import { AdminLeaderboard } from "@/components/admin/admin-leaderboard"

export default async function AdminLeaderboardPage() {
  const [teams, rounds, polls, users] = await Promise.all([
    prisma.team.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { memberships: true, votes: true } } },
    }),
    prisma.round.findMany({
      orderBy: { startDate: "desc" },
      include: {
        _count: { select: { memberships: true, polls: true } },
      },
    }),
    prisma.poll.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        round: { select: { id: true, name: true } },
        _count: { select: { votes: true } },
      },
    }),
    prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ])

  return (
    <AdminLeaderboard
      teams={teams}
      rounds={rounds}
      polls={polls}
      users={users}
    />
  )
}
