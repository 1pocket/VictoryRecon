import Link from 'next/link'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="text-sm"><Link className="text-blue-600" href="/">Dashboard</Link> / Vehicles</div>
      {children}
    </div>
  )
}
