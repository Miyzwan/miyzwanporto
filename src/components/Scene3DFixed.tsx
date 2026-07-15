'use client'

import { useEffect, useRef, useState } from 'react'
import { useMotionValueEvent, useInView } from 'motion/react'
import { useGlobalScrollProgress } from './ScrollProgressProvider'
import Scene3D from './Scene3D'

export default function Scene3DFixed() {
  const scrollYProgress = useGlobalScrollProgress()
  const [progress, setProgress] = useState(0)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const isVisible = useInView(wrapperRef, { margin: '200px 0px 200px 0px' })
  const progressRef = useRef(0)

  useEffect(() => {
    if (isVisible) {
      setProgress(progressRef.current)
    }
  }, [isVisible])

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    progressRef.current = latest
    if (isVisible) {
      setProgress(latest)
    }
  })

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
