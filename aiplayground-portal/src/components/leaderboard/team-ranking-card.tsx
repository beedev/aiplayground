"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Medal, Award, Users } from "lucide-react"

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

const rankConfig: Record<number, { icon: typeof Trophy; gradient: string; badge: string; border: string }> = {
  1: {
    icon: Trophy,
    gradient: "from-amber-50 via-yellow-50 to-amber-50",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    border: "border-amber-300 shadow-amber-100",
  },
  2: {
    icon: Medal,
    gradient: "from-slate-50 via-gray-50 to-slate-50",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    border: "border-slate-300 shadow-slate-100",
  },
  3: {
    icon: Award,
    gradient: "from-orange-50 via-amber-50 to-orange-50",
    badge: "bg-orange-100 text-orange-800 border-orange-200",
    border: "border-orange-200 shadow-orange-100",
  },
}

export function TeamRankingCard({ team }: { team: TeamRanking }) {
  const config = rankConfig[team.rank]
  const RankIcon = config?.icon || Users
  const isTop3 = team.rank <= 3

  return (
    <Card
      className={`transition-all hover:shadow-md ${
        isTop3 ? `${config.border} shadow-sm` : ""
      }`}
    >
      <CardContent className={`p-4 ${isTop3 ? `bg-gradient-to-r ${config.gradient}` : ""}`}>
        <div className="flex items-center gap-4">
          {/* Rank */}
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-white border shadow-sm">
            {isTop3 ? (
              <RankIcon
                className={`h-5 w-5 ${
                  team.rank === 1
                    ? "text-amber-500"
                    : team.rank === 2
                    ? "text-slate-500"
                    : "text-orange-500"
                }`}
              />
            ) : (
              <span className="text-lg font-bold text-gray-400">
                {team.rank}
              </span>
            )}
          </div>

          {/* Team color dot + info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {team.color && (
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: team.color }}
                />
              )}
              <h3 className="font-semibold text-base truncate">{team.name}</h3>
              {isTop3 && (
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 ${config.badge}`}
                >
                  #{team.rank}
                </Badge>
              )}
            </div>
            {team.description && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {team.description}
              </p>
            )}
          </div>

          {/* Members */}
          <div className="flex -space-x-2 flex-shrink-0">
            {team.members.slice(0, 5).map((member) => (
              <Avatar
                key={member.id}
                className="h-7 w-7 border-2 border-white"
                title={`${member.name}${member.role === "CAPTAIN" ? " (Captain)" : ""}`}
              >
                <AvatarFallback
                  className={`text-[10px] ${
                    member.role === "CAPTAIN"
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {team.members.length > 5 && (
              <Avatar className="h-7 w-7 border-2 border-white">
                <AvatarFallback className="text-[10px] bg-gray-100 text-gray-500">
                  +{team.members.length - 5}
                </AvatarFallback>
              </Avatar>
            )}
          </div>

          {/* Vote count */}
          <div className="flex-shrink-0 text-right min-w-[60px]">
            <div className="text-2xl font-bold tracking-tight text-gray-900">
              {team.voteCount}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
              votes
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
