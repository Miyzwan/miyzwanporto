'use client'

import { useRef, useState, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'

interface ProjectCard3DProps {
  children: ReactNode
  className?: string
}

export default function ProjectCard3D({ children, className = '' }: ProjectCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 })

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 200,
    damping: 20,
  })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 200,
    damping: 20,
  })

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5

    mouseX.set(x)
    mouseY.set(y)

    setGlarePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  function handleMouseLeave() {
    mouseX.set(0)
    mouseY.set(0)
    setGlarePos({ x: 50, y: 50 })
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className={`relative ${className}`}
    >
      {children}

      {/* Glare overlay */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(139,92,246,0.15) 0%, rgba(59,130,246,0.08) 40%, transparent 60%)`,
        }}
      />
    </motion.div>
  )
}
