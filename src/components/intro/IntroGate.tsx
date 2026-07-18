'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence } from 'motion/react'
import LoadingScreen from './LoadingScreen'
import JetGame from './JetGame'
import { startLenis, stopLenis } from '@/components/SmoothScroll'

type IntroPhase = 'loading' | 'game' | 'done'

export default function IntroGate() {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')
  const [phase, setPhase] = useState<IntroPhase>('loading')

  const active = phase !== 'done' && !isAdmin

  useEffect(() => {
    if (!active) return
    document.documentElement.style.overflow = 'hidden'
    stopLenis()
    return () => {
      document.documentElement.style.overflow = ''
      startLenis()
    }
  }, [active])

  const handleLoadingComplete = useCallback(() => setPhase('game'), [])
  const handleGameComplete = useCallback(() => setPhase('done'), [])

  if (isAdmin) return null

  return (
    <AnimatePresence mode="wait">
      {phase === 'loading' && <LoadingScreen key="loading" onComplete={handleLoadingComplete} />}
      {phase === 'game' && <JetGame key="game" onComplete={handleGameComplete} />}
    </AnimatePresence>
  )
}
