'use client'
import { useEffect } from 'react'

export default function Toast({ kind, msg, onClose }: { kind: 'ok'|'err', msg: string, onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500)
    return () => clearTimeout(t)
  }, [onClose])
  const cls =
    kind === 'ok'
      ? 'border-green-300 bg-green-50 text-green-800'
      : 'border-red-300 bg-red-50 text-red-800'
  return (
    <div className={`fixed bottom-4 right-4 rounded-lg border px-3 py-2 text-sm shadow ${cls}`}>
      {msg}
    </div>
  )
}
