'use client'
import { useMemo, useState } from 'react'
import CourseCard from '@/components/CourseCard'
import { type Course } from '@/types'

const MOCK: Course[] = [
  { id: 'cse100', code: 'CSE 100', name: 'Advanced Data Structures', description: 'Trees, hashing, memory models.' },
  { id: 'cse110', code: 'CSE 110', name: 'Software Engineering', description: 'Team-based software projects and process.' },
  { id: 'cse158', code: 'CSE 158', name: 'Recommender Systems', description: 'Collaborative filtering, evaluation, ethics.' },
]

export default function CoursesPage() {
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return MOCK
    return MOCK.filter(c => (c.name + ' ' + c.code + ' ' + c.description).toLowerCase().includes(s))
  }, [q])

  return (
    <div>
      <h1 className="text-xl font-semibold">Courses</h1>
      <div className="mt-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or code…"
          className="w-full max-w-md rounded-lg border px-3 py-2"
        />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(c => <CourseCard key={c.id} course={c} />)}
      </div>
      {filtered.length === 0 && (
        <p className="mt-6 text-sm text-gray-600">No courses found. Try another keyword.</p>
      )}
    </div>
  )
}
