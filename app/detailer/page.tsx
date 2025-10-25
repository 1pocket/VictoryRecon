'use client'
import { useEffect, useMemo, useState } from 'react'

export default function DetailerPage() {
  const [pin, setPin] = useState('')
  const [ok, setOk] = useState(false)

  useEffect(() => {
    if (pin && typeof window !== 'undefined') {
      setOk(pin === process.env.NEXT_PUBLIC_DETAILER_PIN || pin === (process.env.DETAILER_PIN as any))
    }
  }, [pin])

  return (
    <div className="max-w-md mx-auto card p-6">
      {!ok ? (
        <div className="space-y-2">
          <h1 className="text-lg font-semibold">Detailer Portal</h1>
          <p className="text-sm text-gray-600">Enter PIN from management to access the queue.</p>
          <input className="input" placeholder="PIN" value={pin} onChange={(e)=>setPin(e.target.value)} />
        </div>
      ) : (
        <div>
          <h2 className="font-semibold mb-2">Queue (read-only MVP)</h2>
          <p className="text-sm text-gray-600">For v1, the detailer can view vehicles in SUBLET_DETAIL status. (Write actions can be added later.)</p>
          <iframe className="w-full h-[70vh]" src="/detailer/queue" />
        </div>
      )}
    </div>
  )
}
