import { prisma } from '@/lib/prisma'

export type Quarter = 'Fall' | 'Winter' | 'Spring' | 'Summer'

export type PlanInput = {
  // canonicalized to IDs before calling plan()
  completedIds: string[]
  targetIds: string[] | 'ALL'

  startYear: number
  startQuarter: Quarter
  unitsPerQuarter: number
  quartersRemaining: number

  geUnitsDone: number
  writingSatisfied: boolean
}

export type QuarterPlan = {
  year: number
  quarter: Quarter
  courseIds: string[]
  units: number
  workload: number
  geUnits: number
}

export type PlanResult = {
  quarters: QuarterPlan[]
  summary: {
    totalUnits: number
    geUnitsRemaining: number
    writing: 'done' | 'pending'
  }
  warnings: string[]
}

export async function plan(input: PlanInput): Promise<PlanResult> {
  // 1) Load catalog slice: everything we might need (MVP = whole table)
  const all = await prisma.course.findMany({
    include: {
      workload: true,
      prereqFor: true, // courses for which this is a prereq
      requires: true,  // Prerequisite records this course requires
      offerings: true
    }
  })
  const byId = new Map(all.map(c => [c.id, c]))

  // 2) Desired set (ALL = everything)
  const desiredIds =
    input.targetIds === 'ALL' ? new Set(all.map(c => c.id)) : new Set(input.targetIds)

  // 3) Build DAG over desired - completed
  // inDeg[v] = number of prereqs (in desired AND not already completed)
  const inDeg = new Map<string, number>()
  const edges = new Map<string, string[]>() // prereq -> [dependents]

  for (const c of all) {
    if (!desiredIds.has(c.id)) continue
    if (input.completedIds.includes(c.id)) continue

    const reqs = c.requires
      .map(r => r.requiresId)
      .filter(id => desiredIds.has(id) && !input.completedIds.includes(id))

    inDeg.set(c.id, reqs.length)
    for (const r of reqs) {
      if (!edges.has(r)) edges.set(r, [])
      edges.get(r)!.push(c.id)
    }
  }

  // 4) Kahn’s algorithm to get feasible order
  const queue: string[] = []
  for (const [id, deg] of inDeg.entries()) if (deg === 0) queue.push(id)

  const topo: string[] = []
  while (queue.length) {
    const u = queue.shift()!
    topo.push(u)
    for (const v of edges.get(u) || []) {
      const nd = (inDeg.get(v) || 0) - 1
      inDeg.set(v, nd)
      if (nd === 0) queue.push(v)
    }
  }

  const unresolved = Array.from(inDeg.entries()).filter(([, deg]) => deg !== 0)
  const warnings: string[] = []
  if (unresolved.length) {
    warnings.push(
      'Some courses could not be scheduled due to unmet or cyclic prerequisites in the selected set.'
    )
  }

  // 5) Generate quarter sequence
  const quarters: Quarter[] = ['Fall', 'Winter', 'Spring', 'Summer']
  const seq: Array<{ year: number; quarter: Quarter }> = []
  let qi = quarters.indexOf(input.startQuarter)
  let y = input.startYear
  for (let i = 0; i < input.quartersRemaining; i++) {
    seq.push({ year: y, quarter: quarters[qi] })
    qi = (qi + 1) % 4
    if (qi === 0) y++
  }

  // 6) GE requirement (pool) — from DB if present, else default 48
  let geDebt = await geRequiredUnitsFromDb(48)
  geDebt = Math.max(0, geDebt - input.geUnitsDone)

  const MAX_WORKLOAD = 10 // soft cap to avoid two heavies

  // candidates remaining (in topo order for deterministic behavior)
  const remaining = new Set(topo)
  const placed = new Set<string>()
  const plans: QuarterPlan[] = []

  for (const slot of seq) {
    let units = 0
    let workload = 0
    const chosen: string[] = []

    // Collect candidates that (a) are offered in this slot AND (b) all prereqs placed/already completed
    const canPlace = Array.from(remaining).filter(id => {
      const c = byId.get(id)!
      const offered = c.offerings.some(o => o.year === slot.year && o.quarter === slot.quarter)
      if (!offered) return false
      const reqs = c.requires.map(r => r.requiresId)
      const ok = reqs.every(
        rid => input.completedIds.includes(rid) || placed.has(rid)
      )
      return ok
    })

    // Greedy heavy -> light to spread difficulty
    canPlace.sort(
      (a, b) => (byId.get(b)!.workload?.weight || 3) - (byId.get(a)!.workload?.weight || 3)
    )

    for (const id of canPlace) {
      const c = byId.get(id)!
      const w = c.workload?.weight ?? 3
      if (units + c.units > input.unitsPerQuarter) continue
      if (workload + w > MAX_WORKLOAD) continue
      chosen.push(id)
      units += c.units
      workload += w
      remaining.delete(id)
      placed.add(id)
    }

    // Fill leftover with GE placeholders (3u chunks as a crude model)
    let geUnits = 0
    while (units < input.unitsPerQuarter && geDebt > 0) {
      const add = Math.min(3, input.unitsPerQuarter - units, geDebt)
      if (add <= 0) break
      geUnits += add
      units += add
      geDebt -= add
    }

    plans.push({
      year: slot.year,
      quarter: slot.quarter,
      courseIds: chosen,
      units,
      workload,
      geUnits
    })
  }

  const totalUnits = plans.reduce((s, p) => s + p.units, 0)
  const writing = input.writingSatisfied ? 'done' : 'pending'

  return {
    quarters: plans,
    summary: { totalUnits, geUnitsRemaining: geDebt, writing },
    warnings
  }
}

async function geRequiredUnitsFromDb(defaultUnits: number): Promise<number> {
  try {
    const pool = await prisma.gECategory.findFirst({
      where: { isHardReq: false },
      select: { unitsReq: true }
    })
    return pool?.unitsReq ?? defaultUnits
  } catch {
    return defaultUnits
  }
}
