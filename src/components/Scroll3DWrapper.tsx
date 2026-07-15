'use client'

import { type ReactNode } from 'react'

/**
 * Previously applied rotateX/translateY as CSS transform on the wrapper,
 * which created a new containing block that broke:
 *   - position: sticky (BlogSection ring)
 *   - GSAP ScrollTrigger calculations (all sections after Hero)
 *
 * Now acts as a pass-through wrapper with NO CSS transforms on ancestors.
 * The 3D scroll effect is handled by Scene3DFixed (the 3D background)
 * and per-section GSAP/Motion animations, which are safe because they
 * apply transforms directly to individual elements, not ancestord wrappers.
 *
 * ⚠️ NEVER add CSS `transform` or `filter` to this wrapper component —
 * doing so will break sticky positioning and ScrollTrigger throughout the app.
 */
export default function Scroll3DWrapper({ children }: { children: ReactNode }) {
  return <>{children}</>
}
