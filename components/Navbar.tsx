import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="w-full border-b bg-white text-black">
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold">Pathways</Link>
        <div className="flex items-center gap-5 text-sm">
          <Link href="/courses" className="hover:underline">Courses</Link>
          <Link href="/clubs" className="hover:underline">Clubs</Link>
          <Link href="/plan" className="rounded px-3 py-1 border hover:bg-gray-50">Plan</Link>
        </div>
      </div>
    </nav>
  )
}
