'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useScroll, type MotionValue } from 'motion/react'

const ScrollProgressContext = createContext<MotionValue<number> | null>(null)

export function useGlobalScrollProgress(): MotionValue<number> {
  const ctx = useContext(ScrollProgressContext)
  if (!ctx) {
    // Fallback for when used outside provider — return a static 0
    return { get: () => 0 } as unknown as MotionValue<number>
  }
  return ctx
}

export default function ScrollProgressProvider({ children }: { children: ReactNode }) {
  const { scrollYProgress } = useScroll()

  return (
    <ScrollProgressContext.Provider value={scrollYProgress}>
      {children}
    </ScrollProgressContext.Provider>
  )
}
