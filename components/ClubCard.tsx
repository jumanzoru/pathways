// components/ClubCard.tsx
'use client'
import Link from 'next/link'
import { type Club } from '@/types'

export default function ClubCard({ club }: { club: Club }) {
  return (
    <Link href={`/clubs/${club.id}`} className="block rounded-2xl border p-4 hover:shadow-sm transition">
      <div className="font-medium">{club.name}</div>
      <p className="mt-1 text-sm text-gray-700 line-clamp-2">{club.description}</p>
      <div className="mt-1 text-xs text-gray-500">{club.tags.join(' • ')}</div>
    </Link>
  )
}
