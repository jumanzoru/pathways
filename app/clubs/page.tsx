// app/clubs/page.tsx
'use client'
import { useMemo, useState } from 'react'
import { MOCK_CLUBS } from '@/lib/mock-data'
import ClubCard from '@/components/ClubCard'
import { type Club } from '@/types'

export default function ClubsPage() {
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return MOCK_CLUBS
    return MOCK_CLUBS.filter((c: Club) =>
      (c.name + ' ' + c.description + ' ' + c.tags.join(' ')).toLowerCase().includes(s)
    )
  }, [q])

  return (
    <div>
      <h1 className="text-xl font-semibold">Clubs</h1>
      <div className="mt-3">
        <input
          aria-label="Search clubs"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, tag, or description…"
          className="w-full max-w-md rounded-lg border px-3 py-2"
        />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => <ClubCard key={c.id} club={c} />)}
      </div>
      {filtered.length === 0 && (
        <p className="mt-6 text-sm text-gray-600">No clubs found.</p>
      )}
    </div>
  )
}
