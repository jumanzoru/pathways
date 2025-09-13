import { z } from 'zod'

export const QuarterEnum = z.enum(['Fall', 'Winter', 'Spring', 'Summer'])

/**
 * Server schema: expects numbers as numbers.
 */
export const PlanInputServer = z.object({
  completedIds: z.array(z.string()).default([]),
  completedCodes: z.array(z.string()).default([]),

  targetIds: z.union([z.literal('ALL'), z.array(z.string())]).default('ALL'),

  startYear: z.number().int(),
  startQuarter: QuarterEnum,
  unitsPerQuarter: z.number().int().min(8).max(20),
  quartersRemaining: z.number().int().min(1).max(20),

  geUnitsDone: z.number().int().min(0).default(0),
  writingSatisfied: z.boolean().default(false),
})

export type PlanInputServerType = z.infer<typeof PlanInputServer>

/**
 * Client schema: coerces string inputs from form fields into numbers.
 * Use this to validate on the /plan page before POSTing.
 */
export const PlanInputClient = z.object({
  completedCodes: z.array(z.string()).default([]),

  startYear: z.coerce.number().int(),
  startQuarter: QuarterEnum,
  unitsPerQuarter: z.coerce.number().int().min(8).max(20),
  quartersRemaining: z.coerce.number().int().min(1).max(20),

  geUnitsDone: z.coerce.number().int().min(0).default(0),
  writingSatisfied: z.coerce.boolean().default(false),
})

export type PlanInputClientType = z.infer<typeof PlanInputClient>

/**
 * Profile payload for saving last-used defaults.
 * (We store only fields that already exist in StudentProfile to avoid a DB migration.)
 */
export const ProfileSaveSchema = z.object({
  // completedCodes gets canonicalized to completedIds on the server
  completedCodes: z.array(z.string()).default([]),
  unitsPerQuarter: z.coerce.number().int().min(8).max(20),
  quartersRemaining: z.coerce.number().int().min(1).max(20),
  geUnitsDone: z.coerce.number().int().min(0).default(0),
  writingSatisfied: z.coerce.boolean().default(false),
  interests: z.array(z.string()).default([]),
})

export type ProfileSaveType = z.infer<typeof ProfileSaveSchema>
