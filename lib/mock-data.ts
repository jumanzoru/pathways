import { type Course, type Club } from '@/types'

export const MOCK_COURSES: Course[] = [
  { id: 'cse100', code: 'CSE 100', name: 'Advanced Data Structures', description: 'Trees, hashing, memory models.' },
  { id: 'cse110', code: 'CSE 110', name: 'Software Engineering', description: 'Team-based projects and process.' },
  { id: 'cse158', code: 'CSE 158', name: 'Recommender Systems', description: 'Collaborative filtering, evaluation, ethics.' },
]

export const MOCK_CLUBS: Club[] = [
  { id: 'tse', name: 'Triton Software Engineering (TSE)', description: 'Project teams for SWE experience.', tags: ['SWE','medium'] },
  { id: 'acm-ai', name: 'ACM AI', description: 'ML/AI community & projects.', tags: ['AI','medium'] },
  { id: 'dsss', name: 'Data Science Student Society', description: 'Talks, recruiting, and DS projects.', tags: ['Data','light'] },
]