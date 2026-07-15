'use client'

import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import type { ReactNode } from 'react'

/**
 * NOTE: Hanya animasi opacity saja pada wrapper.
 * scale/filter/blur/y — semua properti CSS yang membuat containing block
 * (transform/filter) — nge-break position: sticky & position: fixed
 * pada children (BlogSection ring, Navbar, Scene3D, dll).
 *
 * Efek premium diambil alih oleh RouteProgress bar + entrance animasi
 * per-section (Hero, About, Projects, dll yang udah pake Motion).
 */
const transitionConfig = {
  duration: 0.35,
  ease: [0.16, 1, 0.3, 1] as const,
}

const variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: transitionConfig },
  exit: { opacity: 0, transition: { duration: 0.2, ease: 'easeInOut' as const } },
}

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
