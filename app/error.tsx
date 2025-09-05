'use client'
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body className="p-6">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="mt-2 text-sm text-gray-600">{error.message}</p>
        <button
          onClick={() => reset()}
          className="mt-4 rounded border px-3 py-1 hover:bg-gray-50"
        >
          Try again
        </button>
      </body>
    </html>
  )
}
