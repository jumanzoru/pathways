import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export const runtime = 'nodejs'

export async function GET() {
  const items = await prisma.club.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, description: true, tags: true },
  })
  return NextResponse.json({ items, total: items.length })
}
