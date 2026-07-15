'use client'

import type { ReactNode } from 'react'
import { motion } from 'motion/react'

interface MagneticButtonProps {
  href: string
  children: ReactNode
  className?: string
}

export default function MagneticButton({
  href,
  children,
  className = '',
}: MagneticButtonProps) {
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={className}
    >
      {children}
    </motion.a>
  )
}
