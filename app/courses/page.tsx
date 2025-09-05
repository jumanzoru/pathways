'use client'
import { useEffect, useMemo, useState } from 'react'
import CourseCard from '@/components/CourseCard'
import { type Course } from '@/types'

type CoursesResponse = {
  items: Course[]
  total: number
  page: number
  pageSize: number
}

export default function CoursesPage() {
  const [raw, setRaw] = useState('')
  const [q, setQ] = useState('')
  const [data, setData] = useState<Course[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // debounce input (200ms)
  useEffect(() => {
    const t = setTimeout(() => setQ(raw), 200)
    return () => clearTimeout(t)
  }, [raw])

  // fetch from API once (mock for now)
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/courses', { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json: CoursesResponse = await res.json()
        if (!alive) return
        setData(json.items)
        setError(null)
      } catch (e: any) {
        if (!alive) return
        setError(e?.message || 'Failed to load courses')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  const filtered = useMemo(() => {
    if (!data) return []
    const s = q.trim().toLowerCase()
    if (!s) return data
    return data.filter(c =>
      (c.name + ' ' + c.code + ' ' + c.description).toLowerCase().includes(s)
    )
  }, [data, q])

  return (
    <div>
      <h1 className="text-xl font-semibold">Courses</h1>

      <div className="mt-3">
        <input
          aria-label="Search courses"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="Search by name or code…"
          className="w-full max-w-md rounded-lg border px-3 py-2"
        />
      </div>

      {loading && <p className="mt-4 text-gray-500">Loading courses…</p>}
      {error && !loading && <p className="mt-4 text-red-600">Error: {error}</p>}

      {!loading && !error && (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(c => <CourseCard key={c.id} course={c} />)}
          </div>
          {filtered.length === 0 && (
            <p className="mt-6 text-sm text-gray-600">No courses found. Try another keyword.</p>
          )}
        </>
      )}
    </div>
  )
}
