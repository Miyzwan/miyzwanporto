'use client'

import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { useEffect, useState, useRef } from 'react'

export default function RouteProgress() {
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = useState(false)
  const [progress, setProgress] = useState(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevPathRef = useRef(pathname)

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      // Route changed — trigger progress
      prevPathRef.current = pathname
      setIsNavigating(true)
      setProgress(0)

      // Simulate progress fill (fast at start, slow at end)
      requestAnimationFrame(() => {
        setProgress(30)
        timeoutRef.current = setTimeout(() => setProgress(70), 200)
        setTimeout(() => setProgress(95), 400)
        setTimeout(() => {
          setProgress(100)
          setTimeout(() => {
            setIsNavigating(false)
            setProgress(0)
          }, 300)
        }, 600)
      })
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [pathname])

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: progress / 100, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed top-0 left-0 right-0 z-[100] h-[3px] origin-left"
          style={{
            background:
              'linear-gradient(90deg, var(--color-gradient-start), var(--color-gradient-mid), var(--color-gradient-end))',
          }}
        />
      )}
    </AnimatePresence>
  )
}
