import './globals.css'
import Link from 'next/link'
import type { ReactNode } from 'react'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-40 border-b bg-white">
          <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
            <div className="font-bold text-lg">VictoryRecon</div>
            <nav className="flex items-center gap-3 text-sm">
              <Link className="btn" href="/">Dashboard</Link>
              <Link className="btn" href="/vehicles">All Vehicles</Link>
              <Link className="btn" href="/detailer">Detailer</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-4">{children}</main>
      </body>
    </html>
  )
}
