import { NextResponse } from 'next/server'
import { z } from 'zod'
import { plan, type Quarter, type PlanInput } from '@/lib/planner'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

// Accept IDs or course codes for convenience
const bodySchema = z.object({
  // Either of these can be provided; we canonicalize to IDs
  completedIds: z.array(z.string()).optional(),
  completedCodes: z.array(z.string()).optional(),
  targetIds: z.union([z.literal('ALL'), z.array(z.string())]).optional(),
  targetCodes: z.array(z.string()).optional(),

  startYear: z.number().int(),
  startQuarter: z.enum(['Fall','Winter','Spring','Summer'] as [Quarter, Quarter, Quarter, Quarter]),
  unitsPerQuarter: z.number().int().min(8).max(20),
  quartersRemaining: z.number().int().min(1).max(20),

  geUnitsDone: z.number().int().min(0).default(0),
  writingSatisfied: z.boolean().default(false),
})

export async function POST(req: Request) {
  try {
    const raw = await req.json()
    const data = bodySchema.parse(raw)

    // Canonicalize completed to IDs
    const completedIds = await toIds(data.completedIds ?? [], data.completedCodes ?? [])

    // Canonicalize target to IDs (or ALL)
    let targetIds: PlanInput['targetIds'] = 'ALL'
    if (data.targetCodes || data.targetIds) {
      targetIds = data.targetIds ?? (await codesToIds(data.targetCodes ?? []))
    }

    const input: PlanInput = {
      completedIds,
      targetIds,
      startYear: data.startYear,
      startQuarter: data.startQuarter,
      unitsPerQuarter: data.unitsPerQuarter,
      quartersRemaining: data.quartersRemaining,
      geUnitsDone: data.geUnitsDone,
      writingSatisfied: data.writingSatisfied,
    }

    const res = await plan(input)
    return NextResponse.json(res)
  } catch (err: any) {
    const msg = err?.message || 'Invalid request'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}

async function toIds(ids: string[], codes: string[]) {
  if (!codes.length) return ids
  const rows = await prisma.course.findMany({
    where: { code: { in: codes } },
    select: { id: true, code: true }
  })
  const found = new Map(rows.map(r => [r.code, r.id]))
  const missing = codes.filter(c => !found.has(c))
  if (missing.length) {
    // Not fatal; we’ll just ignore missing codes and let the planner skip them.
    // You could also throw here if you want strictness.
  }
  return [...ids, ...rows.map(r => r.id)]
}

async function codesToIds(codes: string[]) {
  if (!codes.length) return []
  const rows = await prisma.course.findMany({
    where: { code: { in: codes } },
    select: { id: true }
  })
  return rows.map(r => r.id)
}
