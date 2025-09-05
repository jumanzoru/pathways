import { NextResponse } from 'next/server'
import { MOCK_COURSES } from '@/lib/mock-data' // you created this earlier

export async function GET() {
  // In a real API you’d read query params, paginate, filter, etc.
  const items = MOCK_COURSES
  const page = 1
  const pageSize = items.length
  const total = items.length

  return NextResponse.json({ items, total, page, pageSize })
}
