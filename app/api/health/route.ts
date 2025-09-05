import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export const runtime = 'nodejs'

export async function GET() {
  const count = await prisma.course.count()
  return NextResponse.json({ ok: true, courses: count, time: new Date().toISOString() })
}
