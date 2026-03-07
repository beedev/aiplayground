"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Vote, CheckCircle2 } from "lucide-react"

interface ActivePoll {
  id: string
  title: string
  description: string | null
  totalVotes: number
}

interface TeamOption {
  id: string
  name: string
  color: string | null
  voteCount: number
}

interface PollVotingProps {
  poll: ActivePoll
  teams: TeamOption[]
  userVote: string | null
  onVoted: () => void
}

export function PollVoting({ poll, teams, userVote, onVoted }: PollVotingProps) {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(userVote)
  const [submitting, setSubmitting] = useState(false)
  const [hasVoted, setHasVoted] = useState(!!userVote)
  const { toast } = useToast()

  async function handleVote() {
    if (!selectedTeam) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/polls/${poll.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: selectedTeam }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Vote failed")
      }
      setHasVoted(true)
      toast({ title: "Vote recorded!" })
      onVoted()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to vote",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const maxVotes = Math.max(...teams.map((t) => t.voteCount), 1)

  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50/50 via-white to-violet-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Vote className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-lg">{poll.title}</CardTitle>
          </div>
          <Badge variant="outline" className="bg-indigo-100 text-indigo-700 border-indigo-200 text-xs">
            {poll.totalVotes} vote{poll.totalVotes !== 1 ? "s" : ""} cast
          </Badge>
        </div>
        {poll.description && (
          <p className="text-sm text-muted-foreground">{poll.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {teams.map((team) => {
          const isSelected = selectedTeam === team.id
          const percentage = poll.totalVotes > 0
            ? Math.round((team.voteCount / poll.totalVotes) * 100)
            : 0
          const barWidth = maxVotes > 0 ? (team.voteCount / maxVotes) * 100 : 0

          return (
            <button
              key={team.id}
              onClick={() => !submitting && setSelectedTeam(team.id)}
              className={`w-full text-left rounded-lg border-2 p-3 transition-all relative overflow-hidden ${
                isSelected
                  ? "border-indigo-500 bg-white shadow-sm"
                  : "border-transparent bg-white/60 hover:bg-white hover:border-gray-200"
              }`}
            >
              {/* Vote bar background */}
              {hasVoted && (
                <div
                  className="absolute inset-y-0 left-0 bg-indigo-50 transition-all duration-500"
                  style={{ width: `${barWidth}%` }}
                />
              )}

              <div className="relative flex items-center gap-3">
                {/* Selection indicator */}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-500"
                      : "border-gray-300"
                  }`}
                >
                  {isSelected && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                  )}
                </div>

                {/* Team color + name */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {team.color && (
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: team.color }}
                    />
                  )}
                  <span className="font-medium text-sm truncate">
                    {team.name}
                  </span>
                </div>

                {/* Vote count (show after voting) */}
                {hasVoted && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {percentage}%
                    </span>
                    <span className="text-sm font-semibold tabular-nums min-w-[24px] text-right">
                      {team.voteCount}
                    </span>
                  </div>
                )}
              </div>
            </button>
          )
        })}

        <div className="pt-2">
          <Button
            onClick={handleVote}
            disabled={!selectedTeam || submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : hasVoted ? (
              "Change Vote"
            ) : (
              "Cast Vote"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
