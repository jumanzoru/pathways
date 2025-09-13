import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ProfileSaveSchema } from '@/lib/schemas'

export const runtime = 'nodejs'

// GET: return current demo profile (or defaults if not created)
export async function GET() {
  const prof = await prisma.studentProfile.findUnique({ where: { id: 'demo' } })
  return NextResponse.json(
    prof ?? {
      id: 'demo',
      unitsPerQuarter: 16,
      quartersRemaining: 6,
      interests: [],
      geUnitsDone: 0,
      writingSatisfied: false,
      completedIds: [],
    }
  )
}

// POST: save last-used defaults
export async function POST(req: Request) {
  try {
    const raw = await req.json()
    const parsed = ProfileSaveSchema.parse(raw)

    // Map completedCodes -> completedIds
    const rows = parsed.completedCodes.length
      ? await prisma.course.findMany({
          where: { code: { in: parsed.completedCodes.map(c => c.toUpperCase().trim()) } },
          select: { id: true },
        })
      : []

    const completedIds = rows.map(r => r.id)

    const saved = await prisma.studentProfile.upsert({
      where: { id: 'demo' },
      update: {
        unitsPerQuarter: parsed.unitsPerQuarter,
        quartersRemaining: parsed.quartersRemaining,
        geUnitsDone: parsed.geUnitsDone,
        writingSatisfied: parsed.writingSatisfied,
        interests: parsed.interests,
        completedIds,
      },
      create: {
        id: 'demo',
        unitsPerQuarter: parsed.unitsPerQuarter,
        quartersRemaining: parsed.quartersRemaining,
        geUnitsDone: parsed.geUnitsDone,
        writingSatisfied: parsed.writingSatisfied,
        interests: parsed.interests,
        completedIds,
      },
    })

    return NextResponse.json(saved)
  } catch (err: any) {
    const msg = err?.message || 'Invalid profile payload'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
