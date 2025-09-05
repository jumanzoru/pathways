import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Make sure this runs on the Node.js runtime (not Edge)
export const runtime = 'nodejs'

export async function GET() {
  // For now: return the first 50 courses
  const items = await prisma.course.findMany({
    take: 50,
    orderBy: { code: 'asc' },
    select: { id: true, code: true, name: true, description: true, units: true },
  })
  return NextResponse.json({
    items,
    total: items.length,
    page: 1,
    pageSize: items.length,
  })
}
