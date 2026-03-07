import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LeaderboardView } from "@/components/leaderboard/leaderboard-view"

export default async function LeaderboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground mt-1">
          Team rankings, polls, and competition results.
        </p>
      </div>
      <LeaderboardView />
    </div>
  )
}
