"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Trophy } from "lucide-react"
import { TeamRankingCard } from "./team-ranking-card"
import { PollVoting } from "./poll-voting"
import { LeaderboardChart } from "./leaderboard-chart"

interface TeamMember {
  id: string
  name: string
  role: string
}

interface TeamRanking {
  id: string
  name: string
  color: string | null
  description: string | null
  voteCount: number
  rank: number
  members: TeamMember[]
}

interface RoundOption {
  id: string
  name: string
  status: string
}

interface ActivePoll {
  id: string
  title: string
  description: string | null
  totalVotes: number
}

interface LeaderboardData {
  round: { id: string; name: string; status: string } | null
  teams: TeamRanking[]
  rounds: RoundOption[]
  activePoll: ActivePoll | null
  userVote: string | null
}

export function LeaderboardView() {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRound, setSelectedRound] = useState<string>("")

  const fetchData = useCallback(async (roundId?: string) => {
    setLoading(true)
    try {
      const url = roundId
        ? `/api/leaderboard?roundId=${roundId}`
        : "/api/leaderboard"
      const res = await fetch(url)
      if (!res.ok) throw new Error()
      const json = await res.json()
      setData(json)
      if (json.round && !roundId) {
        setSelectedRound(json.round.id)
      }
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function handleRoundChange(roundId: string) {
    setSelectedRound(roundId)
    fetchData(roundId)
  }

  function handleVoted() {
    fetchData(selectedRound)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data || !data.round) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground text-lg">No competition rounds yet.</p>
          <p className="text-muted-foreground text-sm mt-1">
            Check back soon — an admin will create the first round.
          </p>
        </CardContent>
      </Card>
    )
  }

  const statusColors: Record<string, string> = {
    UPCOMING: "bg-amber-100 text-amber-800",
    ACTIVE: "bg-emerald-100 text-emerald-800",
    COMPLETED: "bg-gray-100 text-gray-600",
  }

  return (
    <div className="space-y-6">
      {/* Round Selector */}
      <div className="flex items-center gap-3">
        <Select value={selectedRound} onValueChange={handleRoundChange}>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Select round" />
          </SelectTrigger>
          <SelectContent>
            {data.rounds.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge
          className={`text-xs font-medium ${statusColors[data.round.status] || ""}`}
          variant="outline"
        >
          {data.round.status}
        </Badge>
      </div>

      {/* Active Poll */}
      {data.activePoll && (
        <PollVoting
          poll={data.activePoll}
          teams={data.teams}
          userVote={data.userVote}
          onVoted={handleVoted}
        />
      )}

      {/* Chart */}
      {data.teams.length > 0 && (
        <LeaderboardChart teams={data.teams} />
      )}

      {/* Team Rankings */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Team Rankings</h2>
        {data.teams.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No teams assigned to this round yet.
            </CardContent>
          </Card>
        ) : (
          data.teams.map((team) => (
            <TeamRankingCard key={team.id} team={team} />
          ))
        )}
      </div>
    </div>
  )
}
