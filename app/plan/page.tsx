'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type Quarter = 'Fall' | 'Winter' | 'Spring' | 'Summer'

type Course = {
  id: string
  code: string
  name: string
}

type PlanQuarter = {
  year: number
  quarter: Quarter
  courseIds: string[]
  units: number
  workload: number
  geUnits: number
}

type PlanResult = {
  quarters: PlanQuarter[]
  summary: {
    totalUnits: number
    geUnitsRemaining: number
    writing: 'done' | 'pending'
  }
  warnings: string[]
}

type CoursesResp = { items: Course[]; total: number }

export default function PlanPage() {
  // ---- form state
  const now = new Date()
  const defaultYear = now.getFullYear()
  const [startYear, setStartYear] = useState<number>(defaultYear)
  const [startQuarter, setStartQuarter] = useState<Quarter>('Fall')
  const [unitsPerQuarter, setUnitsPerQuarter] = useState<number>(16)
  const [quartersRemaining, setQuartersRemaining] = useState<number>(6)
  const [geUnitsDone, setGeUnitsDone] = useState<number>(0)
  const [writingSatisfied, setWritingSatisfied] = useState<boolean>(false)
  const [completedCodesRaw, setCompletedCodesRaw] = useState<string>('') // comma/space separated codes

  // ---- data/options
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)

  // ---- planner result
  const [result, setResult] = useState<PlanResult | null>(null)
  const [loadingPlan, setLoadingPlan] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load a catalog slice for convenience (codes for autocomplete/awareness)
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setLoadingCourses(true)
        // grab first ~100 courses alphabetically
        const res = await fetch('/api/courses?page=1')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json: CoursesResp = await res.json()
        if (!alive) return
        setCourses(json.items)
      } catch (e: any) {
        // non-fatal
        console.error('Failed to load courses list', e?.message ?? e)
      } finally {
        if (alive) setLoadingCourses(false)
      }
    })()
    return () => { alive = false }
  }, [])

  // Parse completed codes
  const completedCodes = useMemo(() => {
    return completedCodesRaw
      .split(/[, \n]+/)
      .map(s => s.trim().toUpperCase())
      .filter(Boolean)
  }, [completedCodesRaw])

  async function submitPlan(e: React.FormEvent) {
    e.preventDefault()
    setLoadingPlan(true)
    setError(null)
    setResult(null)
    try {
      const body = {
        completedCodes,          // we let the API canonicalize to IDs
        targetIds: 'ALL',        // MVP: plan everything the catalog contains
        startYear, startQuarter,
        unitsPerQuarter, quartersRemaining,
        geUnitsDone, writingSatisfied,
      }
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || `HTTP ${res.status}`)
      }
      const json: PlanResult = await res.json()
      setResult(json)
    } catch (e: any) {
      setError(e?.message || 'Failed to generate plan')
    } finally {
      setLoadingPlan(false)
    }
  }

  // helper for pretty header like "2025 • Fall"
  function label(q: PlanQuarter) {
    return `${q.year} • ${q.quarter}`
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">Roadmap Planner</h1>
      <p className="mt-1 text-sm text-gray-600">
        Generate a quarter-by-quarter plan that respects prerequisites, offerings, and workload caps.
      </p>

      <form onSubmit={submitPlan} className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border p-4">
          <h2 className="font-medium">Start</h2>
          <div className="mt-3 flex gap-3">
            <div className="flex-1">
              <label className="text-sm text-gray-600">Year</label>
              <input
                type="number"
                value={startYear}
                onChange={(e) => setStartYear(Number(e.target.value))}
                className="mt-1 w-full rounded border px-3 py-2"
                min={2000}
                max={2100}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-gray-600">Quarter</label>
              <select
                value={startQuarter}
                onChange={(e) => setStartQuarter(e.target.value as Quarter)}
                className="mt-1 w-full rounded border px-3 py-2"
              >
                <option>Fall</option>
                <option>Winter</option>
                <option>Spring</option>
                <option>Summer</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border p-4">
          <h2 className="font-medium">Load</h2>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-gray-600">Units / Quarter</label>
              <input
                type="number"
                value={unitsPerQuarter}
                onChange={(e) => setUnitsPerQuarter(Number(e.target.value))}
                className="mt-1 w-full rounded border px-3 py-2"
                min={8}
                max={20}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Quarters Remaining</label>
              <input
                type="number"
                value={quartersRemaining}
                onChange={(e) => setQuartersRemaining(Number(e.target.value))}
                className="mt-1 w-full rounded border px-3 py-2"
                min={1}
                max={20}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">GE Units Done</label>
              <input
                type="number"
                value={geUnitsDone}
                onChange={(e) => setGeUnitsDone(Number(e.target.value))}
                className="mt-1 w-full rounded border px-3 py-2"
                min={0}
              />
            </div>
          </div>
          <label className="mt-3 inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={writingSatisfied}
              onChange={(e) => setWritingSatisfied(e.target.checked)}
            />
            <span className="text-sm">Writing requirement satisfied</span>
          </label>
        </div>

        <div className="md:col-span-2 rounded-2xl border p-4">
          <h2 className="font-medium">Completed Courses (codes)</h2>
          <p className="mt-1 text-sm text-gray-600">
            Separate by commas/spaces, e.g. <code>CSE 100, MATH 18</code>.
          </p>
          <textarea
            value={completedCodesRaw}
            onChange={(e) => setCompletedCodesRaw(e.target.value)}
            rows={3}
            className="mt-2 w-full rounded border px-3 py-2"
            placeholder="CSE 100, MATH 18, DSC 40A"
          />
          {loadingCourses ? (
            <p className="mt-2 text-xs text-gray-500">Loading course list…</p>
          ) : (
            <p className="mt-2 text-xs text-gray-500">
              Known examples: {courses.slice(0, 8).map(c => c.code).join(', ')}{courses.length > 8 ? '…' : ''}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            className="rounded-lg border px-4 py-2 hover:bg-gray-50"
            disabled={loadingPlan}
          >
            {loadingPlan ? 'Planning…' : 'Generate Plan'}
          </button>
          {error && <span className="ml-3 text-sm text-red-600">Error: {error}</span>}
        </div>
      </form>

      {/* Results */}
      {result && (
        <div className="mt-6">
          {result.warnings.length > 0 && (
            <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm">
              <b>Warnings:</b> {result.warnings.join(' ')}
            </div>
          )}

          <h2 className="text-lg font-semibold">Plan</h2>
          <p className="text-sm text-gray-600">
            Total units: {result.summary.totalUnits} • GE units remaining: {result.summary.geUnitsRemaining} • Writing: {result.summary.writing}
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.quarters.map((q, i) => (
              <div key={i} className="rounded-2xl border p-4">
                <div className="font-medium">{label(q)}</div>
                <ul className="mt-2 space-y-1 text-sm">
                  {q.courseIds.length === 0 && (
                    <li className="text-gray-500">No major courses this term.</li>
                  )}
                  {q.courseIds.map((id) => (
                    <li key={id}>
                      <CourseChip id={id} />
                    </li>
                  ))}
                </ul>
                <div className="mt-3 text-xs text-gray-600">
                  Units: {q.units} • Workload: {q.workload}
                  {q.geUnits > 0 && <> • GE filler: {q.geUnits}u</>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Small helper component that fetches code/name for a course id (keeps page payload light)
function CourseChip({ id }: { id: string }) {
  const [label, setLabel] = useState<string>(id)
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await fetch(`/api/courses/${id}`)
        if (!res.ok) return
        const c: { id: string; code: string; name: string } = await res.json()
        if (!alive) return
        setLabel(`${c.code} — ${c.name}`)
      } catch {
        // ignore
      }
    })()
    return () => { alive = false }
  }, [id])
  return <Link href={`/courses/${id}`} className="underline">{label}</Link>
}
