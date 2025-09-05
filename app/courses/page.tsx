'use client'
import { useEffect, useMemo, useState } from 'react'
import CourseCard from '@/components/CourseCard'
import { type Course } from '@/types'
import { MOCK } from '@/lib/mock-data'

export default function CoursesPage() {
  const [raw, setRaw] = useState('')
  const [q, setQ] = useState('')

  // simple debounce (200ms)
  useEffect(() => {
    const t = setTimeout(() => setQ(raw), 200)
    return () => clearTimeout(t)
  }, [raw])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return MOCK
    return MOCK.filter(c =>
      (c.name + ' ' + c.code + ' ' + c.description).toLowerCase().includes(s)
    )
  }, [q])

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
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => <CourseCard key={c.id} course={c} />)}
      </div>
      {filtered.length === 0 && (
        <p className="mt-6 text-sm text-gray-600">No courses found. Try another keyword.</p>
      )}
    </div>
  )
}
