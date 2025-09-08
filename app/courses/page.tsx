'use client'
import { useEffect, useMemo, useState } from 'react'
import CourseCard from '@/components/CourseCard'
import { type Course } from '@/types'

type CoursesResp = {
  items: Course[]
  total: number
  page: number
  pageSize: number
}

export default function CoursesPage() {
  const [raw, setRaw] = useState('')
  const [query, setQuery] = useState('')     // debounced value
  const [page, setPage] = useState(1)
  const [data, setData] = useState<CoursesResp | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // debounce input (200ms)
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1)             // reset to first page on new search
      setQuery(raw)
    }, 200)
    return () => clearTimeout(t)
  }, [raw])

  // fetch whenever query or page changes
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (query.trim()) params.set('query', query.trim())
        params.set('page', String(page))
        const res = await fetch(`/api/courses?${params.toString()}`, { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json: CoursesResp = await res.json()
        if (!alive) return
        setData(json)
        setError(null)
      } catch (e: any) {
        if (!alive) return
        setError(e?.message || 'Failed to load courses')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [query, page])

  const items = data?.items ?? []
  const totalPages = useMemo(() => {
    if (!data) return 1
    return Math.max(1, Math.ceil(data.total / data.pageSize))
  }, [data])

  return (
    <div>
      <h1 className="text-xl font-semibold">Courses</h1>

      <div className="mt-3 flex items-center gap-2">
        <input
          aria-label="Search courses"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="Search by name, code, or description…"
          className="w-full max-w-md rounded-lg border px-3 py-2"
        />
        {data && (
          <span className="text-sm text-gray-500 whitespace-nowrap">
            {data.total} result{data.total === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {loading && <p className="mt-4 text-gray-500">Loading courses…</p>}
      {error && !loading && <p className="mt-4 text-red-600">Error: {error}</p>}

      {!loading && !error && (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>

          {items.length === 0 && (
            <p className="mt-6 text-sm text-gray-600">No courses found. Try another keyword.</p>
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex items-center gap-3">
              <button
                className="rounded border px-3 py-1 disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Prev
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                className="rounded border px-3 py-1 disabled:opacity-50"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
