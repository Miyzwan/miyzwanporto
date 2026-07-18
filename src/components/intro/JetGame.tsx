'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

type GamePhase = 'countdown' | 'flying' | 'arrival'

interface Asteroid {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  rotation: number
  rotationSpeed: number
  vertices: number[]
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
}

interface Star {
  x: number
  y: number
  size: number
  speed: number
  opacity: number
}

const TOTAL_DISTANCE = 3000
const MAX_LIVES = 3

export default function JetGame({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [phase, setPhase] = useState<GamePhase>('countdown')
  const [countdown, setCountdown] = useState(3)
  const [lives, setLives] = useState(MAX_LIVES)
  const [distance, setDistance] = useState(TOTAL_DISTANCE)
  const [showRestartFlash, setShowRestartFlash] = useState(false)
  const phaseRef = useRef<GamePhase>('countdown')
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  // Countdown timer
  useEffect(() => {
    if (phase !== 'countdown') return
    const t = setTimeout(() => {
      if (countdown <= 0) {
        setPhase('flying')
      } else {
        setCountdown((c) => c - 1)
      }
    }, 900)
    return () => clearTimeout(t)
  }, [phase, countdown])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = window.innerWidth
    let height = window.innerHeight
    let animationId = 0

    function resize() {
      width = window.innerWidth
      height = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width = width * dpr
      canvas!.height = height * dpr
      canvas!.style.width = `${width}px`
      canvas!.style.height = `${height}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    // --- Game state ---
    const jet = { x: width / 2, y: height - 140, vx: 0, vy: 0, radius: 18 }
    const keys = new Set<string>()
    const pointer = { active: false, x: 0, y: 0 }
    let asteroids: Asteroid[] = []
    let particles: Particle[] = []
    const stars: Star[] = []
    let distanceLeft = TOTAL_DISTANCE
    let livesLeft = MAX_LIVES
    let invincibleUntil = 0
    let spawnTimer = 0
    let lastTime = performance.now()
    let hudTimer = 0
    let arrivalStart = 0
    let arrivalNotified = false

    for (let i = 0; i < 120; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.8 + 0.4,
        speed: Math.random() * 60 + 30,
        opacity: Math.random() * 0.6 + 0.2,
      })
    }

    function resetFlight() {
      distanceLeft = TOTAL_DISTANCE
      livesLeft = MAX_LIVES
      asteroids = []
      particles = []
      jet.x = width / 2
      jet.y = height - 140
      jet.vx = 0
      jet.vy = 0
      setLives(MAX_LIVES)
      setShowRestartFlash(true)
      setTimeout(() => setShowRestartFlash(false), 1800)
    }

    function spawnExplosion(x: number, y: number) {
      const colors = ['#8b5cf6', '#a78bfa', '#3b82f6', '#ec4899', '#f1f5f9']
      for (let i = 0; i < 28; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 260 + 60
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: Math.random() * 0.6 + 0.4,
          size: Math.random() * 3 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
        })
      }
    }

    function spawnAsteroid(progress: number) {
      const radius = Math.random() * 22 + 14
      const speed = (Math.random() * 120 + 160) * (1 + progress * 0.9)
      const vertices: number[] = []
      const count = 9
      for (let i = 0; i < count; i++) {
        vertices.push(0.75 + Math.random() * 0.45)
      }
      asteroids.push({
        x: Math.random() * (width - radius * 2) + radius,
        y: -radius - 10,
        vx: (Math.random() - 0.5) * 60,
        vy: speed,
        radius,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 2,
        vertices,
      })
    }

    // --- Input ---
    const keydown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(k)) {
        e.preventDefault()
        keys.add(k)
      }
    }
    const keyup = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase())
    const pointerdown = (e: PointerEvent) => {
      pointer.active = true
      pointer.x = e.clientX
      pointer.y = e.clientY
    }
    const pointermove = (e: PointerEvent) => {
      if (!pointer.active) return
      pointer.x = e.clientX
      pointer.y = e.clientY
    }
    const pointerup = () => {
      pointer.active = false
    }

    window.addEventListener('keydown', keydown)
    window.addEventListener('keyup', keyup)
    canvas.addEventListener('pointerdown', pointerdown)
    window.addEventListener('pointermove', pointermove)
    window.addEventListener('pointerup', pointerup)

    // --- Drawing ---
    function drawJet(now: number) {
      const blink = now < invincibleUntil && Math.floor(now / 100) % 2 === 0
      ctx!.save()
      ctx!.translate(jet.x, jet.y)
      const tilt = Math.max(-0.35, Math.min(0.35, jet.vx / 900))
      ctx!.rotate(tilt)
      if (blink) ctx!.globalAlpha = 0.25

      // Thruster
      const flameLength = 22 + Math.random() * 10
      const flame = ctx!.createLinearGradient(0, 14, 0, 14 + flameLength)
      flame.addColorStop(0, 'rgba(139, 92, 246, 0.9)')
      flame.addColorStop(0.5, 'rgba(59, 130, 246, 0.6)')
      flame.addColorStop(1, 'rgba(236, 72, 153, 0)')
      ctx!.beginPath()
      ctx!.moveTo(-6, 14)
      ctx!.lineTo(0, 14 + flameLength)
      ctx!.lineTo(6, 14)
      ctx!.closePath()
      ctx!.fillStyle = flame
      ctx!.fill()

      // Body
      ctx!.shadowColor = '#8b5cf6'
      ctx!.shadowBlur = 18
      ctx!.beginPath()
      ctx!.moveTo(0, -22)
      ctx!.lineTo(7, -4)
      ctx!.lineTo(18, 12)
      ctx!.lineTo(7, 8)
      ctx!.lineTo(0, 14)
      ctx!.lineTo(-7, 8)
      ctx!.lineTo(-18, 12)
      ctx!.lineTo(-7, -4)
      ctx!.closePath()
      const body = ctx!.createLinearGradient(0, -22, 0, 14)
      body.addColorStop(0, '#f1f5f9')
      body.addColorStop(0.4, '#a78bfa')
      body.addColorStop(1, '#7c3aed')
      ctx!.fillStyle = body
      ctx!.fill()
      ctx!.shadowBlur = 0

      // Cockpit
      ctx!.beginPath()
      ctx!.ellipse(0, -6, 3.5, 6, 0, 0, Math.PI * 2)
      ctx!.fillStyle = 'rgba(59, 130, 246, 0.9)'
      ctx!.fill()

      ctx!.restore()
    }

    function drawEarth(progress: number, arrivalT: number) {
      let radius: number
      const cx = width / 2
      let cy: number

      if (phaseRef.current === 'arrival') {
        const eased = 1 - Math.pow(1 - Math.min(arrivalT, 1), 3)
        radius = 30 + eased * Math.max(width, height) * 1.2
        cy = height * 0.28 + eased * height * 0.4
      } else {
        radius = 24 + progress * 110
        cy = height * 0.16 + progress * height * 0.12
      }

      // Atmosphere glow
      const glow = ctx!.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.6)
      glow.addColorStop(0, 'rgba(59, 130, 246, 0.35)')
      glow.addColorStop(1, 'rgba(59, 130, 246, 0)')
      ctx!.beginPath()
      ctx!.arc(cx, cy, radius * 1.6, 0, Math.PI * 2)
      ctx!.fillStyle = glow
      ctx!.fill()

      // Planet body
      const body = ctx!.createRadialGradient(
        cx - radius * 0.3,
        cy - radius * 0.3,
        radius * 0.1,
        cx,
        cy,
        radius
      )
      body.addColorStop(0, '#60a5fa')
      body.addColorStop(0.55, '#3b82f6')
      body.addColorStop(1, '#1e3a8a')
      ctx!.beginPath()
      ctx!.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx!.fillStyle = body
      ctx!.fill()

      // Continents
      ctx!.save()
      ctx!.beginPath()
      ctx!.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx!.clip()
      ctx!.fillStyle = 'rgba(16, 185, 129, 0.55)'
      const blobs = [
        [cx - radius * 0.35, cy - radius * 0.2, radius * 0.28],
        [cx + radius * 0.25, cy + radius * 0.3, radius * 0.22],
        [cx + radius * 0.1, cy - radius * 0.45, radius * 0.16],
      ]
      blobs.forEach(([bx, by, br]) => {
        ctx!.beginPath()
        ctx!.arc(bx, by, br, 0, Math.PI * 2)
        ctx!.fill()
      })
      // Clouds
      ctx!.fillStyle = 'rgba(241, 245, 249, 0.35)'
      const clouds = [
        [cx - radius * 0.1, cy + radius * 0.1, radius * 0.3],
        [cx + radius * 0.3, cy - radius * 0.25, radius * 0.24],
      ]
      clouds.forEach(([bx, by, br]) => {
        ctx!.beginPath()
        ctx!.ellipse(bx, by, br, br * 0.35, 0.3, 0, Math.PI * 2)
        ctx!.fill()
      })
      ctx!.restore()

      return { cx, cy, radius }
    }

    function drawAsteroid(a: Asteroid) {
      ctx!.save()
      ctx!.translate(a.x, a.y)
      ctx!.rotate(a.rotation)
      ctx!.beginPath()
      const count = a.vertices.length
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2
        const r = a.radius * a.vertices[i]
        const px = Math.cos(angle) * r
        const py = Math.sin(angle) * r
        if (i === 0) ctx!.moveTo(px, py)
        else ctx!.lineTo(px, py)
      }
      ctx!.closePath()
      const grad = ctx!.createRadialGradient(-a.radius * 0.3, -a.radius * 0.3, 0, 0, 0, a.radius)
      grad.addColorStop(0, '#475569')
      grad.addColorStop(1, '#1e293b')
      ctx!.fillStyle = grad
      ctx!.fill()
      ctx!.strokeStyle = 'rgba(148, 163, 184, 0.4)'
      ctx!.lineWidth = 1
      ctx!.stroke()
      ctx!.restore()
    }

    // --- Main loop ---
    function loop(now: number) {
      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now
      const progress = 1 - distanceLeft / TOTAL_DISTANCE
      const isFlying = phaseRef.current === 'flying'
      const isArrival = phaseRef.current === 'arrival'
      const scrollSpeed = isArrival ? 500 : 180 + progress * 160

      ctx!.clearRect(0, 0, width, height)

      // Background gradient
      const bg = ctx!.createLinearGradient(0, 0, 0, height)
      bg.addColorStop(0, '#0d0d1a')
      bg.addColorStop(1, '#06060b')
      ctx!.fillStyle = bg
      ctx!.fillRect(0, 0, width, height)

      // Stars
      stars.forEach((s) => {
        s.y += (s.speed + scrollSpeed) * dt
        if (s.y > height) {
          s.y = -2
          s.x = Math.random() * width
        }
        ctx!.beginPath()
        ctx!.arc(s.x, s.y, s.size, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(241, 245, 249, ${s.opacity})`
        ctx!.fill()
      })

      // Earth
      let arrivalT = 0
      if (isArrival) {
        if (arrivalStart === 0) arrivalStart = now
        arrivalT = (now - arrivalStart) / 1800
      }
      const earth = drawEarth(progress, arrivalT)

      // Jet movement
      if (isFlying) {
        if (pointer.active) {
          const ease = 1 - Math.pow(0.001, dt)
          const prevX = jet.x
          jet.x += (pointer.x - jet.x) * ease
          jet.y += (pointer.y - jet.y) * ease
          jet.vx = (jet.x - prevX) / Math.max(dt, 0.001)
        } else {
          const accel = 2600
          const maxSpeed = 460
          if (keys.has('arrowleft') || keys.has('a')) jet.vx -= accel * dt
          if (keys.has('arrowright') || keys.has('d')) jet.vx += accel * dt
          if (keys.has('arrowup') || keys.has('w')) jet.vy -= accel * dt
          if (keys.has('arrowdown') || keys.has('s')) jet.vy += accel * dt
          jet.vx *= Math.pow(0.02, dt)
          jet.vy *= Math.pow(0.02, dt)
          jet.vx = Math.max(-maxSpeed, Math.min(maxSpeed, jet.vx))
          jet.vy = Math.max(-maxSpeed, Math.min(maxSpeed, jet.vy))
          jet.x += jet.vx * dt
          jet.y += jet.vy * dt
        }
        jet.x = Math.max(jet.radius, Math.min(width - jet.radius, jet.x))
        jet.y = Math.max(height * 0.35, Math.min(height - jet.radius - 20, jet.y))

        // Distance
        distanceLeft = Math.max(0, distanceLeft - 68 * dt * (1 + progress * 0.6))

        // Spawn asteroids
        spawnTimer -= dt
        if (spawnTimer <= 0) {
          spawnAsteroid(progress)
          spawnTimer = Math.max(0.28, 0.75 - progress * 0.45)
        }

        // Win check
        if (distanceLeft <= 0) {
          setDistance(0)
          setPhase('arrival')
        }
      }

      // During arrival, jet flies toward earth
      if (isArrival) {
        const t = Math.min(arrivalT, 1)
        const eased = 1 - Math.pow(1 - t, 2)
        jet.x += (earth.cx - jet.x) * eased * dt * 3
        jet.y += (earth.cy - jet.y) * eased * dt * 3
        if (arrivalT >= 1 && !arrivalNotified) {
          arrivalNotified = true
          setTimeout(() => onCompleteRef.current(), 500)
        }
      }

      // Asteroids
      asteroids.forEach((a) => {
        a.y += a.vy * dt
        a.x += a.vx * dt
        a.rotation += a.rotationSpeed * dt
        if (a.x < a.radius || a.x > width - a.radius) a.vx *= -1
      })
      asteroids = asteroids.filter((a) => a.y < height + a.radius * 2)
      asteroids.forEach(drawAsteroid)

      // Collision
      if (isFlying && now > invincibleUntil) {
        for (const a of asteroids) {
          const dx = jet.x - a.x
          const dy = jet.y - a.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < jet.radius + a.radius * 0.8) {
            spawnExplosion(jet.x, jet.y)
            livesLeft -= 1
            setLives(livesLeft)
            invincibleUntil = now + 1500
            asteroids = asteroids.filter((ast) => ast !== a)
            if (livesLeft <= 0) {
              resetFlight()
            }
            break
          }
        }
      }

      // Particles
      particles.forEach((p) => {
        p.life += dt
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.vx *= Math.pow(0.1, dt)
        p.vy *= Math.pow(0.1, dt)
        const alpha = Math.max(0, 1 - p.life / p.maxLife)
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2)
        ctx!.fillStyle = p.color
        ctx!.globalAlpha = alpha
        ctx!.fill()
        ctx!.globalAlpha = 1
      })
      particles = particles.filter((p) => p.life < p.maxLife)

      // Jet
      drawJet(now)

      // HUD sync (~10x/sec)
      hudTimer -= dt
      if (hudTimer <= 0 && isFlying) {
        setDistance(Math.ceil(distanceLeft))
        hudTimer = 0.1
      }

      animationId = requestAnimationFrame(loop)
    }

    animationId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('keydown', keydown)
      window.removeEventListener('keyup', keyup)
      canvas.removeEventListener('pointerdown', pointerdown)
      window.removeEventListener('pointermove', pointermove)
      window.removeEventListener('pointerup', pointerup)
    }
  }, [])

  const distanceProgress = 1 - distance / TOTAL_DISTANCE

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-bg-primary"
      exit={{ opacity: 0, transition: { duration: 0.6 } }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ touchAction: 'none' }}
      />

      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4 sm:p-6">
        <div className="flex gap-2">
          {Array.from({ length: MAX_LIVES }).map((_, i) => (
            <i
              key={i}
              className={`fas fa-heart text-xl transition-all duration-300 ${
                i < lives ? 'text-danger' : 'text-border scale-75 opacity-40'
              }`}
              style={i < lives ? { textShadow: '0 0 12px rgba(239, 68, 68, 0.6)' } : undefined}
            />
          ))}
        </div>
        <div className="w-40 text-right sm:w-56">
          <div className="mb-1 font-mono text-xs text-text-secondary sm:text-sm">
            Jarak ke Bumi: <span className="text-accent-light">{distance.toLocaleString('id-ID')} km</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-card/70">
            <div
              className="h-full rounded-full bg-gradient-accent transition-[width] duration-200"
              style={{ width: `${distanceProgress * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Countdown */}
      <AnimatePresence>
        {phase === 'countdown' && (
          <motion.div
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
            exit={{ opacity: 0 }}
          >
            <motion.div
              key={countdown}
              initial={{ opacity: 0, scale: 1.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mb-6 text-7xl font-bold text-gradient sm:text-8xl"
            >
              {countdown > 0 ? countdown : 'TERBANG!'}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass gradient-border rounded-2xl px-6 py-4 text-center"
            >
              <p className="mb-1 text-sm font-semibold text-text-primary">
                Terbangkan jet menuju Bumi!
              </p>
              <p className="text-xs text-text-secondary">
                <i className="fas fa-keyboard mr-1 text-accent" /> Panah / WASD
                <span className="mx-2 text-text-muted">•</span>
                <i className="fas fa-hand-pointer mr-1 text-accent" /> Sentuh &amp; geser
              </p>
              <p className="mt-1 text-xs text-text-muted">Hindari asteroid — 3 nyawa!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Restart flash */}
      <AnimatePresence>
        {showRestartFlash && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-x-0 top-24 flex justify-center"
          >
            <div className="glass gradient-border rounded-xl px-5 py-3 text-sm font-semibold text-danger">
              <i className="fas fa-triangle-exclamation mr-2" />
              Jet hancur! Penerbangan dimulai ulang.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Arrival flash */}
      <AnimatePresence>
        {phase === 'arrival' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 1] }}
            transition={{ duration: 2.2, times: [0, 0.75, 1] }}
            className="pointer-events-none absolute inset-0 bg-gradient-accent"
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
