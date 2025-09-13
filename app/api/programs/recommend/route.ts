import { NextResponse } from 'next/server'
export const runtime = 'nodejs'

// Map high-level interests -> programs/clubs to recommend
const MAP: Record<string, string[]> = {
  SWE: ['Triton Software Engineering (TSE)', 'CSES Dev'],
  AI: ['ACM AI', 'Data Science Student Society'],
  Systems: ['Engineers for Exploration (E4E)'],
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const interests = (searchParams.get('interests') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const set = new Set<string>()
  for (const i of interests) (MAP[i] || []).forEach((x) => set.add(x))

  return NextResponse.json({ programs: Array.from(set) })
}
