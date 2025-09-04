'use client'
import Link from 'next/link'
import { type Course } from '@/types'

type Props = { course: Course }

export default function CourseCard({ course }: Props) {
  return (
    <Link
      href={`/courses/${course.id}`}
      className="block rounded-2xl border p-4 hover:shadow-sm transition"
    >
      <div className="text-xs text-gray-500">{course.code}</div>
      <div className="mt-0.5 font-medium">{course.name}</div>
      <p className="mt-1 text-sm text-gray-700 line-clamp-2">{course.description}</p>
    </Link>
  )
}
