'use client'

import { useEffect, useRef, useState } from 'react'
import { useMotionValueEvent, useInView } from 'motion/react'
import { usePathname } from 'next/navigation'
import { useGlobalScrollProgress } from './ScrollProgressProvider'
import Scene3D from './Scene3D'

export default function Scene3DFixed() {
  const pathname = usePathname()
  const scrollYProgress = useGlobalScrollProgress()
  const [progress, setProgress] = useState(0)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const isVisible = useInView(wrapperRef, { margin: '200px 0px 200px 0px' })
  const progressRef = useRef(0)

  // Skip 3D background on admin pages — prevents input interference
  const isAdmin = pathname.startsWith('/admin')

  useEffect(() => {
    if (!isVisible || isAdmin) return
    setProgress(progressRef.current)
  }, [isVisible, isAdmin])

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    progressRef.current = latest
    if (isVisible && !isAdmin) {
      setProgress(latest)
    }
  })

  if (isAdmin) return null

  return (
    <div
      ref={wrapperRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <Scene3D scrollProgress={progress} opacity={0.9} />
    </div>
  )
}
