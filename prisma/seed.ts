// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// ---- Seed data (edit/expand as you like) ----
const COURSES = [
  { code:'MATH 18', name:'Linear Algebra', units:4, w:3 },
  { code:'MATH 20A', name:'Calc I', units:4, w:3 },
  { code:'MATH 20B', name:'Calc II', units:4, w:3 },
  { code:'MATH 20C', name:'Calc III', units:4, w:3 },
  { code:'CSE 100', name:'Advanced Data Structures', units:4, w:4 },
  { code:'CSE 101', name:'Design & Analysis of Algorithms', units:4, w:5 },
  { code:'CSE 110', name:'Software Engineering', units:4, w:5 },
  { code:'CSE 120', name:'Operating Systems', units:4, w:4 },
  { code:'CSE 140', name:'Components & Design', units:4, w:4 },
  { code:'CSE 150A', name:'Intro AI: Probabilistic Reasoning', units:4, w:4 },
  { code:'CSE 151A', name:'Intro ML', units:4, w:4 },
  { code:'CSE 151B', name:'Deep Learning', units:4, w:5 },
  { code:'CSE 158', name:'Recommender Systems', units:4, w:3 },
  { code:'DSC 40A', name:'Theoretical Foundations I', units:4, w:3 },
  { code:'DSC 40B', name:'Theoretical Foundations II', units:4, w:3 },
  { code:'DSC 80',  name:'Intro to Data Science', units:4, w:3 },
  { code:'DSC 102', name:'Systems for DS', units:4, w:4 },
  { code:'DSC 106', name:'Data Viz', units:4, w:3 },
  { code:'DSC 140A',name:'Probabilistic Modeling & ML', units:4, w:4 },
  { code:'MATH 109',name:'Math Reasoning', units:4, w:4 },
  { code:'MATH 154',name:'Discrete Math & Graph Theory', units:4, w:4 },
  { code:'MATH 180A',name:'Intro to Probability', units:4, w:4 },
  { code:'MATH 181A',name:'Intro to Math Stats I', units:4, w:4 },
  // add more if you want
]

const PREREQS: Array<[string,string]> = [
  ['CSE 101','CSE 100'],
  ['CSE 151B','CSE 151A'],
  ['CSE 150A','MATH 18'],
  ['CSE 150A','MATH 20C'],
  ['CSE 151A','MATH 18'],
  ['CSE 151A','MATH 20C'],
  ['CSE 158','CSE 100'],
  ['DSC 40B','DSC 40A'],
  ['DSC 140A','MATH 18'],
  ['DSC 140A','MATH 20C'],
  ['MATH 181A','MATH 180A'],
]

const OFFERINGS: Array<[string, number, string]> = [
  ['CSE 110', 2025, 'Fall'],   ['CSE 110', 2026, 'Winter'], ['CSE 110', 2026, 'Spring'],
  ['CSE 158', 2025, 'Winter'], ['CSE 158', 2026, 'Spring'],
  ['CSE 100', 2025, 'Fall'],   ['CSE 100', 2026, 'Spring'],
]

const CLUBS = [
  { name:'Triton Software Engineering (TSE)', description:'Project teams for SWE experience', tags:['SWE','medium']},
  { name:'CSES Dev', description:'Client-facing UCSD projects', tags:['SWE','medium']},
  { name:'ACM AI', description:'ML/AI community & projects', tags:['AI','medium']},
  { name:'Engineers for Exploration (E4E)', description:'Field research + embedded systems', tags:['Systems','medium']},
  { name:'DSSS', description:'Data Science Student Society', tags:['Data','light']},
]

// ---- Seed logic ----
async function main() {
  // 1) Courses + Workload
  const created = await Promise.all(
    COURSES.map(async (c) => {
      const course = await prisma.course.upsert({
        where: { code: c.code },
        update: { name: c.name, description: `${c.name} at UCSD.`, units: c.units },
        create: { code: c.code, name: c.name, description: `${c.name} at UCSD.`, units: c.units },
      })
      await prisma.workload.upsert({
        where: { courseId: course.id },
        update: { weight: c.w },
        create: { courseId: course.id, weight: c.w },
      })
      return course
    })
  )

  // Helper: map code -> course
  const byCode = new Map(created.map((c) => [c.code, c]))

  // 2) Prereqs
  for (const [courseCode, reqCode] of PREREQS) {
    const course = byCode.get(courseCode)
    const req = byCode.get(reqCode)
    if (!course || !req) continue
    await prisma.prerequisite.upsert({
      where: { courseId_requiresId: { courseId: course.id, requiresId: req.id } },
      update: {},
      create: { courseId: course.id, requiresId: req.id },
    })
  }

  // 3) Offerings
  for (const [code, year, quarter] of OFFERINGS) {
    const course = byCode.get(code)
    if (!course) continue
    await prisma.courseOffering.upsert({
      where: { courseId_year_quarter: { courseId: course.id, year, quarter } },
      update: {},
      create: { courseId: course.id, year, quarter },
    })
  }

  // 4) Clubs
  for (const club of CLUBS) {
    await prisma.club.upsert({
      where: { name: club.name },
      update: { description: club.description, tags: club.tags },
      create: club,
    })
  }

  // 5) GE buckets (simple MVP buckets)
  await prisma.gECategory.createMany({
    data: [
      { name: 'Writing',    unitsReq: 0,  isHardReq: true  },
      { name: 'Other GEs',  unitsReq: 48, isHardReq: false },
    ],
    skipDuplicates: true,
  })
}

main()
  .then(() => console.log('✅ Seed complete'))
  .catch((e) => {
    console.error('❌ Seed error', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
