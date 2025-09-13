import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { plan } from '@/lib/planner'
import { PlanInputServer } from '@/lib/schemas'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const raw = await req.json()

    // 1) Validate & normalize with shared server schema
    const parsed = PlanInputServer.parse(raw)

    // 2) Map completedCodes -> IDs and merge with any provided completedIds
    const codeRows = parsed.completedCodes.length
      ? await prisma.course.findMany({
          where: { code: { in: parsed.completedCodes.map(c => c.toUpperCase().trim()) } },
          select: { id: true },
        })
      : []
    const completedIds = [...parsed.completedIds, ...codeRows.map(r => r.id)]

    // 3) Resolve target set
    //    Prefer raw.targetCodes if provided; otherwise use parsed.targetIds (can be 'ALL' or string[])
    let targetIds: 'ALL' | string[] = parsed.targetIds
    const targetCodes: string[] | undefined = Array.isArray((raw as any)?.targetCodes)
      ? (raw as any).targetCodes
      : undefined

    if (targetCodes && targetCodes.length) {
      const targets = await prisma.course.findMany({
        where: { code: { in: targetCodes.map(c => c.toUpperCase().trim()) } },
        select: { id: true },
      })
      targetIds = targets.map(t => t.id)
    }

    // 4) Call planner
    const res = await plan({
      completedIds,
      targetIds,
      startYear: parsed.startYear,
      startQuarter: parsed.startQuarter,
      unitsPerQuarter: parsed.unitsPerQuarter,
      quartersRemaining: parsed.quartersRemaining,
      geUnitsDone: parsed.geUnitsDone,
      writingSatisfied: parsed.writingSatisfied,
    })

    return NextResponse.json(res)
  } catch (err: any) {
    const msg = err?.message || 'Invalid request'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
