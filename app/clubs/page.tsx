import { type Club } from '@/types'

const CLUBS: Club[] = [
  { id: 'tse', name: 'Triton Software Engineering (TSE)', description: 'Project teams for SWE experience.', tags: ['SWE', 'medium'] },
  { id: 'acm-ai', name: 'ACM AI', description: 'ML/AI community & projects.', tags: ['AI', 'medium'] },
]

export default function ClubsPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold">Clubs</h1>
      <ul className="mt-3 space-y-2">
        {CLUBS.map(c => (
          <li key={c.id} className="rounded-2xl border p-4">
            <div className="font-medium">{c.name}</div>
            <p className="text-sm text-gray-700">{c.description}</p>
            <div className="mt-1 text-xs text-gray-500">{c.tags.join(' • ')}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
