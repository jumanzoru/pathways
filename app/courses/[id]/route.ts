import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export const runtime = 'nodejs'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const c = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      workload: true,
      offerings: true,
      requires: { select: { requiresId: true } }
    }
  })
  if (!c) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(c)
}
