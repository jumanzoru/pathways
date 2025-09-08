import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('query') || '').trim()
  const page = Math.max(1, Number(searchParams.get('page') || '1'))

  const pageSize = 12
  const skip = (page - 1) * pageSize

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { code: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      }
    : {}

  const [items, total] = await Promise.all([
    prisma.course.findMany({
      where,
      take: pageSize,
      skip,
      orderBy: { code: 'asc' },
      select: { id: true, code: true, name: true, description: true, units: true },
    }),
    prisma.course.count({ where }),
  ])

  return NextResponse.json({ items, total, page, pageSize })
}
