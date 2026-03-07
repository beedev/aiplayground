"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Trophy,
  Vote,
  Loader2,
  CalendarDays,
  UserPlus,
  Power,
  PowerOff,
} from "lucide-react"

interface Team {
  id: string
  name: string
  description: string | null
  color: string | null
  _count: { memberships: number; votes: number }
}

interface Round {
  id: string
  name: string
  description: string | null
  status: string
  startDate: Date | string
  endDate: Date | string
  _count: { memberships: number; polls: number }
}

interface Poll {
  id: string
  title: string
  description: string | null
  isActive: boolean
  closedAt: Date | string | null
  round: { id: string; name: string }
  _count: { votes: number }
}

interface UserOption {
  id: string
  name: string
  email: string
}

interface AdminLeaderboardProps {
  teams: Team[]
  rounds: Round[]
  polls: Poll[]
  users: UserOption[]
}

export function AdminLeaderboard({
  teams: initialTeams,
  rounds: initialRounds,
  polls: initialPolls,
  users,
}: AdminLeaderboardProps) {
  const { toast } = useToast()
  const router = useRouter()

  // Team form state
  const [showTeamForm, setShowTeamForm] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null)
  const [teamName, setTeamName] = useState("")
  const [teamDesc, setTeamDesc] = useState("")
  const [teamColor, setTeamColor] = useState("#6366f1")
  const [teamLoading, setTeamLoading] = useState(false)

  // Round form state
  const [showRoundForm, setShowRoundForm] = useState(false)
  const [roundName, setRoundName] = useState("")
  const [roundDesc, setRoundDesc] = useState("")
  const [roundStart, setRoundStart] = useState("")
  const [roundEnd, setRoundEnd] = useState("")
  const [roundLoading, setRoundLoading] = useState(false)
  const [deletingRound, setDeletingRound] = useState<Round | null>(null)

  // Membership state
  const [assignRoundId, setAssignRoundId] = useState<string | null>(null)
  const [assignments, setAssignments] = useState<Record<string, string>>({}) // userId → teamId
  const [assignLoading, setAssignLoading] = useState(false)
  const [assignFetching, setAssignFetching] = useState(false)
  const [assignSearch, setAssignSearch] = useState("")

  // Poll form state
  const [showPollForm, setShowPollForm] = useState(false)
  const [pollTitle, setPollTitle] = useState("")
  const [pollDesc, setPollDesc] = useState("")
  const [pollRoundId, setPollRoundId] = useState("")
  const [pollLoading, setPollLoading] = useState(false)
  const [deletingPoll, setDeletingPoll] = useState<Poll | null>(null)

  // ─── Teams ─────────────────────────────

  function openTeamForm(team?: Team) {
    if (team) {
      setEditingTeam(team)
      setTeamName(team.name)
      setTeamDesc(team.description || "")
      setTeamColor(team.color || "#6366f1")
    } else {
      setEditingTeam(null)
      setTeamName("")
      setTeamDesc("")
      setTeamColor("#6366f1")
    }
    setShowTeamForm(true)
  }

  async function handleTeamSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!teamName.trim()) return
    setTeamLoading(true)
    try {
      const body = { name: teamName.trim(), description: teamDesc.trim() || undefined, color: teamColor }
      if (editingTeam) {
        const res = await fetch(`/api/admin/teams/${editingTeam.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error((await res.json()).error || "Update failed")
        toast({ title: "Team updated" })
      } else {
        const res = await fetch("/api/admin/teams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error((await res.json()).error || "Create failed")
        toast({ title: "Team created" })
      }
      setShowTeamForm(false)
      router.refresh()
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed", variant: "destructive" })
    } finally {
      setTeamLoading(false)
    }
  }

  async function handleDeleteTeam() {
    if (!deletingTeam) return
    try {
      const res = await fetch(`/api/admin/teams/${deletingTeam.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast({ title: "Team deleted" })
      router.refresh()
    } catch {
      toast({ title: "Error", description: "Failed to delete team", variant: "destructive" })
    } finally {
      setDeletingTeam(null)
    }
  }

  // ─── Rounds ─────────────────────────────

  async function handleRoundSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!roundName.trim() || !roundStart || !roundEnd) return
    setRoundLoading(true)
    try {
      const res = await fetch("/api/admin/rounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: roundName.trim(),
          description: roundDesc.trim() || undefined,
          startDate: new Date(roundStart).toISOString(),
          endDate: new Date(roundEnd).toISOString(),
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Create failed")
      toast({ title: "Round created" })
      setShowRoundForm(false)
      setRoundName("")
      setRoundDesc("")
      setRoundStart("")
      setRoundEnd("")
      router.refresh()
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed", variant: "destructive" })
    } finally {
      setRoundLoading(false)
    }
  }

  async function handleRoundStatus(roundId: string, status: string) {
    try {
      const res = await fetch(`/api/admin/rounds/${roundId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      toast({ title: `Round marked ${status.toLowerCase()}` })
      router.refresh()
    } catch {
      toast({ title: "Error", description: "Failed to update round", variant: "destructive" })
    }
  }

  async function handleDeleteRound() {
    if (!deletingRound) return
    try {
      const res = await fetch(`/api/admin/rounds/${deletingRound.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast({ title: "Round deleted" })
      router.refresh()
    } catch {
      toast({ title: "Error", description: "Failed to delete round", variant: "destructive" })
    } finally {
      setDeletingRound(null)
    }
  }

  // ─── Memberships ────────────────────────

  async function openAssignDialog(roundId: string) {
    setAssignRoundId(roundId)
    setAssignSearch("")
    setAssignFetching(true)
    try {
      const res = await fetch(`/api/admin/rounds/${roundId}/memberships`)
      if (res.ok) {
        const data = await res.json()
        const existing: Record<string, string> = {}
        for (const m of data) {
          existing[m.user.id] = m.team.id
        }
        setAssignments(existing)
      }
    } catch {
      // Start with empty assignments
      setAssignments({})
    } finally {
      setAssignFetching(false)
    }
  }

  function toggleAssignment(userId: string, teamId: string) {
    setAssignments((prev) => {
      const next = { ...prev }
      if (next[userId] === teamId) {
        delete next[userId]
      } else {
        next[userId] = teamId
      }
      return next
    })
  }

  async function handleSaveAssignments() {
    if (!assignRoundId) return
    setAssignLoading(true)
    try {
      const memberships = Object.entries(assignments).map(([userId, teamId]) => ({
        userId,
        teamId,
      }))
      if (memberships.length === 0) {
        toast({ title: "No assignments to save" })
        setAssignLoading(false)
        return
      }
      const res = await fetch(`/api/admin/rounds/${assignRoundId}/memberships`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberships }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Save failed")
      toast({ title: `${memberships.length} member${memberships.length !== 1 ? "s" : ""} assigned` })
      setAssignRoundId(null)
      router.refresh()
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed", variant: "destructive" })
    } finally {
      setAssignLoading(false)
    }
  }

  // ─── Polls ──────────────────────────────

  async function handlePollSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!pollTitle.trim() || !pollRoundId) return
    setPollLoading(true)
    try {
      const res = await fetch("/api/admin/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roundId: pollRoundId,
          title: pollTitle.trim(),
          description: pollDesc.trim() || undefined,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Create failed")
      toast({ title: "Poll created" })
      setShowPollForm(false)
      setPollTitle("")
      setPollDesc("")
      setPollRoundId("")
      router.refresh()
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed", variant: "destructive" })
    } finally {
      setPollLoading(false)
    }
  }

  async function handleTogglePoll(pollId: string, isActive: boolean) {
    try {
      const res = await fetch(`/api/admin/polls/${pollId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      })
      if (!res.ok) throw new Error()
      toast({ title: isActive ? "Poll closed" : "Poll activated" })
      router.refresh()
    } catch {
      toast({ title: "Error", description: "Failed to update poll", variant: "destructive" })
    }
  }

  async function handleDeletePoll() {
    if (!deletingPoll) return
    try {
      const res = await fetch(`/api/admin/polls/${deletingPoll.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast({ title: "Poll deleted" })
      router.refresh()
    } catch {
      toast({ title: "Error", description: "Failed to delete poll", variant: "destructive" })
    } finally {
      setDeletingPoll(null)
    }
  }

  // ─── Status helpers ─────────────────────

  const statusColors: Record<string, string> = {
    UPCOMING: "bg-amber-100 text-amber-800",
    ACTIVE: "bg-emerald-100 text-emerald-800",
    COMPLETED: "bg-gray-100 text-gray-600",
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Leaderboard Management</h2>
        <p className="text-muted-foreground mt-1">
          Manage teams, rounds, member assignments, and polls.
        </p>
      </div>

      <Tabs defaultValue="teams">
        <TabsList>
          <TabsTrigger value="teams">
            <Users className="h-3.5 w-3.5 mr-1.5" />
            Teams ({initialTeams.length})
          </TabsTrigger>
          <TabsTrigger value="rounds">
            <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
            Rounds ({initialRounds.length})
          </TabsTrigger>
          <TabsTrigger value="polls">
            <Vote className="h-3.5 w-3.5 mr-1.5" />
            Polls ({initialPolls.length})
          </TabsTrigger>
        </TabsList>

        {/* ─── Teams Tab ─── */}
        <TabsContent value="teams" className="space-y-3 mt-4">
          <div className="flex justify-end">
            <Button onClick={() => openTeamForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Team
            </Button>
          </div>
          {initialTeams.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No teams yet. Create your first team to get started.
              </CardContent>
            </Card>
          ) : (
            initialTeams.map((team) => (
              <Card key={team.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0 border"
                      style={{ backgroundColor: team.color || "#6366f1" }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">{team.name}</h3>
                      {team.description && (
                        <p className="text-xs text-muted-foreground truncate">{team.description}</p>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {team._count.memberships} member{team._count.memberships !== 1 ? "s" : ""}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {team._count.votes} vote{team._count.votes !== 1 ? "s" : ""}
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openTeamForm(team)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setDeletingTeam(team)}>
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* ─── Rounds Tab ─── */}
        <TabsContent value="rounds" className="space-y-3 mt-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowRoundForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Round
            </Button>
          </div>
          {initialRounds.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No rounds yet. Create your first competition round.
              </CardContent>
            </Card>
          ) : (
            initialRounds.map((round) => (
              <Card key={round.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{round.name}</h3>
                        <Badge className={`text-[10px] ${statusColors[round.status]}`} variant="outline">
                          {round.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(round.startDate).toLocaleDateString()} — {new Date(round.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {round._count.memberships} member{round._count.memberships !== 1 ? "s" : ""}
                    </Badge>
                    {round.status === "UPCOMING" && (
                      <Button variant="outline" size="sm" onClick={() => handleRoundStatus(round.id, "ACTIVE")}>
                        <Power className="h-3 w-3 mr-1" /> Activate
                      </Button>
                    )}
                    {round.status === "ACTIVE" && (
                      <Button variant="outline" size="sm" onClick={() => handleRoundStatus(round.id, "COMPLETED")}>
                        <PowerOff className="h-3 w-3 mr-1" /> Complete
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => openAssignDialog(round.id)}>
                      <UserPlus className="h-3 w-3 mr-1" /> Assign
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setDeletingRound(round)}>
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* ─── Polls Tab ─── */}
        <TabsContent value="polls" className="space-y-3 mt-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowPollForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Poll
            </Button>
          </div>
          {initialPolls.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No polls yet. Create a poll to start collecting votes.
              </CardContent>
            </Card>
          ) : (
            initialPolls.map((poll) => (
              <Card key={poll.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{poll.title}</h3>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${poll.isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"}`}
                        >
                          {poll.isActive ? "Active" : poll.closedAt ? "Closed" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{poll.round.name}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {poll._count.votes} vote{poll._count.votes !== 1 ? "s" : ""}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePoll(poll.id, poll.isActive)}
                    >
                      {poll.isActive ? (
                        <><PowerOff className="h-3 w-3 mr-1" /> Close</>
                      ) : (
                        <><Power className="h-3 w-3 mr-1" /> Activate</>
                      )}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setDeletingPoll(poll)}>
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* ─── Team Form Dialog ─── */}
      <Dialog open={showTeamForm} onOpenChange={setShowTeamForm}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{editingTeam ? "Edit Team" : "Create Team"}</DialogTitle>
            <DialogDescription>
              {editingTeam ? "Update team details." : "Add a new competition team."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTeamSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input id="team-name" value={teamName} onChange={(e) => setTeamName(e.target.value)} required disabled={teamLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-desc">Description</Label>
              <Textarea id="team-desc" value={teamDesc} onChange={(e) => setTeamDesc(e.target.value)} rows={2} disabled={teamLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-color">Color</Label>
              <div className="flex items-center gap-3">
                <input type="color" id="team-color" value={teamColor} onChange={(e) => setTeamColor(e.target.value)} className="h-9 w-12 rounded border cursor-pointer" disabled={teamLoading} />
                <Input value={teamColor} onChange={(e) => setTeamColor(e.target.value)} className="font-mono text-sm" disabled={teamLoading} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowTeamForm(false)} disabled={teamLoading}>Cancel</Button>
              <Button type="submit" disabled={teamLoading}>
                {teamLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : editingTeam ? "Update" : "Create Team"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Round Form Dialog ─── */}
      <Dialog open={showRoundForm} onOpenChange={setShowRoundForm}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Create Round</DialogTitle>
            <DialogDescription>Add a new competition round.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRoundSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="round-name">Name</Label>
              <Input id="round-name" value={roundName} onChange={(e) => setRoundName(e.target.value)} placeholder="e.g. Round 1" required disabled={roundLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="round-desc">Description</Label>
              <Textarea id="round-desc" value={roundDesc} onChange={(e) => setRoundDesc(e.target.value)} rows={2} disabled={roundLoading} />
            </div>
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="round-start">Start Date</Label>
                <Input id="round-start" type="date" value={roundStart} onChange={(e) => setRoundStart(e.target.value)} required disabled={roundLoading} />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="round-end">End Date</Label>
                <Input id="round-end" type="date" value={roundEnd} onChange={(e) => setRoundEnd(e.target.value)} required disabled={roundLoading} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowRoundForm(false)} disabled={roundLoading}>Cancel</Button>
              <Button type="submit" disabled={roundLoading}>
                {roundLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : "Create Round"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Assign Members Dialog ─── */}
      <Dialog open={!!assignRoundId} onOpenChange={(open) => { if (!open) setAssignRoundId(null) }}>
        <DialogContent className="sm:max-w-[640px] max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Assign Members to Teams</DialogTitle>
            <DialogDescription>
              Click a team chip to assign a user. Click again to unassign. One team per user per round.
            </DialogDescription>
          </DialogHeader>

          {assignFetching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Team legend */}
              <div className="flex flex-wrap gap-2 pb-2 border-b">
                {initialTeams.map((t) => {
                  const count = Object.values(assignments).filter((tid) => tid === t.id).length
                  return (
                    <div key={t.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="w-2.5 h-2.5 rounded-full border" style={{ backgroundColor: t.color || "#6366f1" }} />
                      <span className="font-medium">{t.name}</span>
                      <span className="text-[10px]">({count})</span>
                    </div>
                  )
                })}
                <div className="ml-auto text-xs text-muted-foreground">
                  {Object.keys(assignments).length}/{users.length} assigned
                </div>
              </div>

              {/* Search */}
              <Input
                placeholder="Search users..."
                value={assignSearch}
                onChange={(e) => setAssignSearch(e.target.value)}
                className="h-8 text-sm"
              />

              {/* User list with team chips */}
              <div className="flex-1 overflow-y-auto space-y-1 min-h-0 -mx-1 px-1">
                {users
                  .filter((u) =>
                    !assignSearch ||
                    u.name.toLowerCase().includes(assignSearch.toLowerCase()) ||
                    u.email.toLowerCase().includes(assignSearch.toLowerCase())
                  )
                  .map((user) => {
                    const currentTeamId = assignments[user.id]
                    return (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 rounded-lg border px-3 py-2 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          {initialTeams.map((team) => {
                            const isActive = currentTeamId === team.id
                            return (
                              <button
                                key={team.id}
                                onClick={() => toggleAssignment(user.id, team.id)}
                                className={`
                                  h-7 px-2.5 rounded-full text-[11px] font-medium border transition-all
                                  ${isActive
                                    ? "text-white border-transparent shadow-sm scale-105"
                                    : "text-gray-500 border-gray-200 bg-white hover:border-gray-300 hover:text-gray-700"
                                  }
                                `}
                                style={isActive ? { backgroundColor: team.color || "#6366f1" } : undefined}
                                title={`${isActive ? "Remove from" : "Assign to"} ${team.name}`}
                              >
                                {team.name}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  {Object.keys(assignments).length} member{Object.keys(assignments).length !== 1 ? "s" : ""} assigned
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setAssignRoundId(null)} disabled={assignLoading}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveAssignments} disabled={assignLoading || Object.keys(assignments).length === 0}>
                    {assignLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Assignments"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Poll Form Dialog ─── */}
      <Dialog open={showPollForm} onOpenChange={setShowPollForm}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Create Poll</DialogTitle>
            <DialogDescription>Create a voting poll for a round.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePollSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Round</Label>
              <Select value={pollRoundId} onValueChange={setPollRoundId}>
                <SelectTrigger><SelectValue placeholder="Select round" /></SelectTrigger>
                <SelectContent>
                  {initialRounds.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="poll-title">Title</Label>
              <Input id="poll-title" value={pollTitle} onChange={(e) => setPollTitle(e.target.value)} placeholder="e.g. Best Team — Round 1" required disabled={pollLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="poll-desc">Description</Label>
              <Textarea id="poll-desc" value={pollDesc} onChange={(e) => setPollDesc(e.target.value)} rows={2} disabled={pollLoading} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowPollForm(false)} disabled={pollLoading}>Cancel</Button>
              <Button type="submit" disabled={pollLoading || !pollRoundId}>
                {pollLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : "Create Poll"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Confirm Dialogs ─── */}
      <ConfirmDialog
        open={!!deletingTeam}
        onOpenChange={(open) => { if (!open) setDeletingTeam(null) }}
        title="Delete Team"
        description={deletingTeam ? `Delete "${deletingTeam.name}"? This removes all memberships and votes. Cannot be undone.` : ""}
        onConfirm={handleDeleteTeam}
        destructive
      />
      <ConfirmDialog
        open={!!deletingRound}
        onOpenChange={(open) => { if (!open) setDeletingRound(null) }}
        title="Delete Round"
        description={deletingRound ? `Delete "${deletingRound.name}"? This removes all memberships and polls. Cannot be undone.` : ""}
        onConfirm={handleDeleteRound}
        destructive
      />
      <ConfirmDialog
        open={!!deletingPoll}
        onOpenChange={(open) => { if (!open) setDeletingPoll(null) }}
        title="Delete Poll"
        description={deletingPoll ? `Delete "${deletingPoll.title}"? All votes will be lost. Cannot be undone.` : ""}
        onConfirm={handleDeletePoll}
        destructive
      />
    </div>
  )
}
