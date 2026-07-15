'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'
import PageTransition from './PageTransition'
import RouteProgress from './RouteProgress'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  return (
    <>
      <RouteProgress />
      {!isAdmin && <Navbar />}
      <PageTransition>{children}</PageTransition>
      {!isAdmin && <Footer />}
    </>
  )
}
