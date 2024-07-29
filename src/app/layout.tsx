import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Multiple Choice Generator',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}

function Navbar() {
  return (
    <nav className="ml-2 mt-2">
      <ul>
        <li>
          <Link href="/">
            <span role="img" aria-label="home">
              🏠
            </span>{' '}
            Home
          </Link>
        </li>
      </ul>
    </nav>
  )
}
