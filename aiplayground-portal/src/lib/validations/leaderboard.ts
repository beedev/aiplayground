import { z } from "zod"

export const createTeamSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex color")
    .optional(),
})

export const updateTeamSchema = createTeamSchema.partial()

export const createRoundSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
})

export const updateRoundSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  status: z.enum(["UPCOMING", "ACTIVE", "COMPLETED"]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

export const assignMembershipSchema = z.object({
  teamId: z.string().min(1),
  userId: z.string().min(1),
  role: z.enum(["MEMBER", "CAPTAIN"]).optional(),
})

export const bulkAssignMembershipsSchema = z.object({
  memberships: z.array(assignMembershipSchema).min(1),
})

export const createPollSchema = z.object({
  roundId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
})

export const updatePollSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const castVoteSchema = z.object({
  teamId: z.string().min(1),
})
