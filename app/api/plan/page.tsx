'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Toast from '@/components/Toast'
import { PlanInputClient } from '@/lib/schemas'

type Quarter = 'Fall' | 'Winter' | 'Spring' | 'Summer'

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
  summary: { totalUnits: number; geUnitsRemaining: number; writing: 'done' | 'pending' }
  warnings: string[]
}

type Course = { id: string; code: string; name: string }
type CoursesResp = { items: Course[]; total: number }

type Club = { id: string; name: string; description: string; tags: string[] }
type ClubsResp = { items: Club[]; total: number }

const INTERESTS = ['SWE', 'AI', 'Systems'] as const

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
  const [completedCodesRaw, setCompletedCodesRaw] = useState<string>('')
  const [interests, setInterests] = useState<string[]>(['SWE']) // default one selected

  // ---- options hint
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)

  // ---- planner result
  const [result, setResult] = useState<PlanResult | null>(null)
  const [loadingPlan, setLoadingPlan] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ---- toasts
  const [toast, setToast] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(null)

  // Load some courses for examples (non-blocking)
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setLoadingCourses(true)
        const res = await fetch('/api/courses?page=1', { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json: CoursesResp = await res.json()
        if (alive) setCourses(json.items)
      } catch {
        /* hint only */
      } finally {
        if (alive) setLoadingCourses(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const completedCodes = useMemo(
    () =>
      completedCodesRaw
        .split(/[, \n]+/)
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean),
    [completedCodesRaw]
  )

  async function submitPlan(e: React.FormEvent) {
    e.preventDefault()
    const parsed = PlanInputClient.safeParse({
      completedCodes,
      startYear,
      startQuarter,
      unitsPerQuarter,
      quartersRemaining,
      geUnitsDone,
      writingSatisfied,
    })
    if (!parsed.success) {
      setToast({ kind: 'err', msg: parsed.error.issues[0]?.message || 'Invalid inputs' })
      return
    }

    setLoadingPlan(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json: PlanResult = await res.json()
      setResult(json)
      setToast({ kind: 'ok', msg: 'Plan generated' })
    } catch (e: any) {
      setError(e?.message || 'Failed to generate plan')
      setToast({ kind: 'err', msg: 'Planner error' })
    } finally {
      setLoadingPlan(false)
    }
  }

  async function saveDefaults() {
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedCodes,
          unitsPerQuarter,
          quartersRemaining,
          geUnitsDone,
          writingSatisfied,
          interests,
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      setToast({ kind: 'ok', msg: 'Defaults saved' })
    } catch {
      setToast({ kind: 'err', msg: 'Could not save defaults' })
    }
  }

  async function loadDefaults() {
    try {
      const res = await fetch('/api/profile', { cache: 'no-store' })
      if (!res.ok) throw new Error('Load failed')
      const p = await res.json()
      setUnitsPerQuarter(p.unitsPerQuarter ?? 16)
      setQuartersRemaining(p.quartersRemaining ?? 6)
      setGeUnitsDone(p.geUnitsDone ?? 0)
      setWritingSatisfied(Boolean(p.writingSatisfied))
      // interests are optional in DB; keep existing if missing
      if (Array.isArray(p.interests)) setInterests(p.interests)
      setToast({ kind: 'ok', msg: 'Defaults loaded' })
    } catch {
      setToast({ kind: 'err', msg: 'Could not load defaults' })
    }
  }

  function toggleInterest(tag: string) {
    setInterests((cur) => (cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag]))
  }

  function label(q: PlanQuarter) {
    return `${q.year} • ${q.quarter}`
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">Roadmap Planner</h1>
      <p className="mt-1 text-sm text-gray-600">Plan courses + get program recommendations by interest.</p>

      <form onSubmit={submitPlan} className="mt-4 grid gap-4 md:grid-cols-2">
        {/* Start */}
        <div className="rounded-2xl border p-4">
          <h2 className="font-medium">Start</h2>
          <div className="mt-3 flex gap-3">
            <div className="flex-1">
              <label className="text-sm text-gray-600">Year</label>
              <input
                type="number"
                value={startYear}
                onChange={(e) => setStartYear(Number(e.target.value) || defaultYear)}
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

        {/* Load */}
        <div className="rounded-2xl border p-4">
          <h2 className="font-medium">Load</h2>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-gray-600">Units / Quarter</label>
              <input
                type="number"
                value={unitsPerQuarter}
                onChange={(e) => setUnitsPerQuarter(Math.min(20, Math.max(8, Number(e.target.value) || 16)))}
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
                onChange={(e) => setQuartersRemaining(Math.min(20, Math.max(1, Number(e.target.value) || 6)))}
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
                onChange={(e) => setGeUnitsDone(Math.max(0, Number(e.target.value) || 0))}
                className="mt-1 w-full rounded border px-3 py-2"
                min={0}
              />
            </div>
          </div>
          <label className="mt-3 inline-flex items-center gap-2">
            <input type="checkbox" checked={writingSatisfied} onChange={(e) => setWritingSatisfied(e.target.checked)} />
            <span className="text-sm">Writing requirement satisfied</span>
          </label>
        </div>

        {/* Completed + Interests */}
        <div className="md:col-span-2 rounded-2xl border p-4">
          <h2 className="font-medium">Completed Courses (codes) & Interests</h2>
          <p className="mt-1 text-sm text-gray-600">
            Codes e.g. <code>CSE 100, MATH 18</code>. Pick interests to get club/program recs.
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
              Known examples: {courses.slice(0, 8).map((c) => c.code).join(', ')}
              {courses.length > 8 ? '…' : ''}
            </p>
          )}

          <div className="mt-3">
            <div className="text-sm text-gray-600 mb-1">Interests</div>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((tag) => {
                const active = interests.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleInterest(tag)}
                    className={`px-2 py-1 rounded border text-xs ${
                      active ? 'bg-black text-white border-black' : 'bg-white hover:bg-gray-50'
                    }`}
                    aria-pressed={active}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <button type="button" onClick={saveDefaults} className="rounded-lg border px-3 py-2 hover:bg-gray-50">
              Save defaults
            </button>
            <button type="button" onClick={loadDefaults} className="rounded-lg border px-3 py-2 hover:bg-gray-50">
              Load defaults
            </button>
            <button
              type="submit"
              disabled={loadingPlan}
              aria-busy={loadingPlan}
              className="rounded-lg border px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
            >
              {loadingPlan ? 'Planning…' : 'Generate Plan'}
            </button>
            {error && <span className="self-center text-sm text-red-600">Error: {error}</span>}
          </div>
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
            Total units: {result.summary.totalUnits} • GE remaining: {result.summary.geUnitsRemaining} • Writing:{' '}
            {result.summary.writing}
          </p>

          {result.quarters.length === 0 ? (
            <p className="mt-4 text-sm text-gray-600">No schedule could be generated. Add offerings or relax constraints.</p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.quarters.map((q, i) => (
                <section key={`${q.year}-${q.quarter}-${i}`} className="rounded-2xl border p-4">
                  <h3 className="font-medium">{label(q)}</h3>
                  <div className="my-2 flex flex-wrap gap-2">
                    {q.courseIds.map((id) => (
                      <span key={id} className="px-2 py-1 rounded bg-gray-100 text-xs hover:bg-gray-200">
                        <CourseChip id={id} />
                      </span>
                    ))}
                    {q.geUnits > 0 && (
                      <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs">GE +{q.geUnits}u</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600">
                    {q.units} units · workload {q.workload}/10
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* Recommended programs */}
          <div className="mt-8">
            <h3 className="font-medium">Recommended Programs</h3>
            <RecommendedPrograms interests={interests} />
          </div>
        </div>
      )}

      {toast && <Toast kind={toast.kind} msg={toast.msg} onClose={() => setToast(null)} />}
    </div>
  )
}

function CourseChip({ id }: { id: string }) {
  const [label, setLabel] = useState<string>(id)
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await fetch(`/api/courses/${id}`, { cache: 'no-store' })
        if (!res.ok) {
          if (alive) setLabel(id.slice(0, 6))
          return
        }
        const c: { id: string; code: string; name: string } = await res.json()
        if (alive) setLabel(`${c.code} — ${c.name}`)
      } catch {}
    })()
    return () => {
      alive = false
    }
  }, [id])
  return (
    <Link href={`/courses/${id}`} className="underline">
      {label}
    </Link>
  )
}

function RecommendedPrograms({ interests }: { interests: string[] }) {
  const [programs, setPrograms] = useState<string[]>([])
  const [clubs, setClubs] = useState<Club[]>([])

  useEffect(() => {
    let alive = true
    ;(async () => {
      // fetch recommendations
      const qs = new URLSearchParams({ interests: interests.join(',') })
      const res = await fetch(`/api/programs/recommend?${qs.toString()}`, { cache: 'no-store' })
      if (res.ok) {
        const json: { programs: string[] } = await res.json()
        if (alive) setPrograms(json.programs)
      }
      // fetch clubs to map names -> ids for links
      const rc = await fetch('/api/clubs', { cache: 'no-store' })
      if (rc.ok) {
        const cj: ClubsResp = await rc.json()
        if (alive) setClubs(cj.items)
      }
    })()
    return () => {
      alive = false
    }
  }, [interests])

  if (programs.length === 0) {
    return <p className="mt-2 text-sm text-gray-600">No matches yet—toggle interests to see suggestions.</p>
  }

  // build a map name -> id for linking when possible
  const byName = new Map(clubs.map((c) => [c.name, c.id]))

  return (
    <ul className="mt-2 space-y-1 text-sm">
      {programs.map((p) => {
        const id = byName.get(p)
        return (
          <li key={p} className="rounded border px-3 py-2">
            {id ? <Link className="underline" href={`/clubs/${id}`}>{p}</Link> : p}
          </li>
        )
      })}
    </ul>
  )
}
