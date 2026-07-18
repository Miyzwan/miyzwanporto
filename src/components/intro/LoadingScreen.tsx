'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'

const messages = [
  'Menyalakan mesin...',
  'Memeriksa sistem navigasi...',
  'Memuat modul penerbangan...',
  'Mengisi bahan bakar...',
  'Siap lepas landas...',
]

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const start = performance.now()
    const minDuration = 2000
    let raf = 0

    const tick = (now: number) => {
      const elapsed = now - start
      const pageLoaded = document.readyState === 'complete'
      const target = pageLoaded ? 100 : 90
      const t = Math.min(elapsed / minDuration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      const value = Math.min(eased * 100, target)
      setProgress(Math.floor(value))

      if (value >= 100) {
        setTimeout(onComplete, 400)
        return
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [onComplete])

  const messageIndex = Math.min(
    Math.floor((progress / 100) * messages.length),
    messages.length - 1
  )

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg-primary"
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 flex h-24 w-24 items-center justify-center rounded-full glass gradient-border"
      >
        <i
          className="fas fa-rocket text-4xl text-accent"
          style={{ animation: 'engine-pulse 1.2s ease-in-out infinite' }}
        />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-2 text-2xl font-bold text-gradient sm:text-3xl"
      >
        Dimas Dwi Ismaunnizam
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mb-10 text-sm text-text-secondary"
      >
        Misi: Menuju Bumi
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-64 sm:w-80"
      >
        <div className="mb-3 flex items-center justify-between font-mono text-xs text-text-muted">
          <span>{messages[messageIndex]}</span>
          <span className="text-accent-light">{progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-card">
          <div
            className="h-full rounded-full bg-gradient-accent transition-[width] duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}
