'use client'

import { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import gsap from 'gsap'
import MagneticButton from './MagneticButton'

const words = [
  'Dimas Dwi Ismaunnizam',
  'Machine Learning Engineer',
  'Web Developer',
  'AI Enthusiast',
]

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const typewriterRef = useRef<HTMLSpanElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const glowRef2 = useRef<HTMLDivElement>(null)
  const wordIndexRef = useRef(0)
  const charIndexRef = useRef(0)
  const isDeletingRef = useRef(false)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let particles: Array<{
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number
    }> = []
    let animationId = 0
    let running = false

    function resize() {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
    }

    function createParticles() {
      particles = []
      const count = Math.floor((canvas!.width * canvas!.height) / 15000)
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.5 + 0.1,
        })
      }
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      particles.forEach((p) => {
        p.x += p.speedX
        p.y += p.speedY
        if (p.x > canvas!.width) p.x = 0
        if (p.x < 0) p.x = canvas!.width
        if (p.y > canvas!.height) p.y = 0
        if (p.y < 0) p.y = canvas!.height
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(139, 92, 246, ${p.opacity})`
        ctx!.fill()
      })
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx!.beginPath()
            ctx!.moveTo(particles[i].x, particles[i].y)
            ctx!.lineTo(particles[j].x, particles[j].y)
            ctx!.strokeStyle = `rgba(139, 92, 246, ${0.1 * (1 - dist / 120)})`
            ctx!.lineWidth = 0.5
            ctx!.stroke()
          }
        }
      }
      animationId = requestAnimationFrame(animate)
    }

    function startAnim() {
      if (running) return
      running = true
      animate()
    }

    function stopAnim() {
      running = false
      cancelAnimationFrame(animationId)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startAnim()
        } else {
          stopAnim()
        }
      },
      { threshold: [0, 0.1] }
    )
    observer.observe(canvas)
    resize()
    createParticles()
    startAnim()

    const handleResize = () => {
      resize()
      createParticles()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      stopAnim()
      observer.disconnect()
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // GSAP ScrollTrigger parallax for glow divs
  useEffect(() => {
    import('gsap/ScrollTrigger').then((mod) => {
      const ScrollTrigger = mod.default || mod
      gsap.registerPlugin(ScrollTrigger)

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      })

      tl.to(glowRef.current, { y: 120, opacity: 0.1, ease: 'power1.out' })
      tl.to(glowRef2.current, { y: -80, opacity: 0.2, ease: 'power1.out' }, 0)

      return () => ScrollTrigger.getAll().forEach((t) => t.kill())
    })
  }, [])

  // Typewriter
  useEffect(() => {
    const el = typewriterRef.current
    if (!el) return

    let timeoutId: ReturnType<typeof setTimeout>

    function type() {
      const currentWord = words[wordIndexRef.current]
      if (!isDeletingRef.current) {
        el!.textContent = currentWord.substring(0, charIndexRef.current + 1)
        charIndexRef.current++
        if (charIndexRef.current === currentWord.length) {
          isDeletingRef.current = true
          timeoutId = setTimeout(type, 2000)
          return
        }
      } else {
        el!.textContent = currentWord.substring(0, charIndexRef.current - 1)
        charIndexRef.current--
        if (charIndexRef.current === 0) {
          isDeletingRef.current = false
          wordIndexRef.current = (wordIndexRef.current + 1) % words.length
        }
      }
      const speed = isDeletingRef.current ? 50 : 100
      timeoutId = setTimeout(type, speed)
    }

    timeoutId = setTimeout(type, 500)
    return () => clearTimeout(timeoutId)
  }, [])

  return (
    <motion.section
      ref={containerRef}
      id="hero"
      className="min-h-screen flex items-center relative pt-[70px] overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
      />

      <motion.div
        ref={glowRef}
        className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
        style={{
          zIndex: 2,
          background:
            'radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(59,130,246,0.1) 50%, transparent 70%)',

        }}
      />

      <motion.div
        ref={glowRef2}
        className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-10 blur-[100px]"
        style={{
          zIndex: 2,
          background:
            'radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(139,92,246,0.1) 50%, transparent 70%)',
        }}
      />

      <motion.div className="max-w-6xl mx-auto px-5 w-full" style={{ zIndex: 4, opacity }}>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-accent-light text-sm font-medium tracking-[2px] uppercase mb-2"
        >
          Halo, saya
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 min-h-[60px]"
        >
          <span ref={typewriterRef} />
          <span className="text-accent animate-[cursor-blink_0.7s_infinite]">|</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-lg text-text-secondary font-medium mb-5"
        >
          Machine Learning &amp; Web Developer
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-base text-text-muted max-w-[540px] leading-relaxed mb-8"
        >
          Computer Science student at Binus University passionate about creating
          intelligent solutions and building scalable web applications.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-wrap gap-4 mb-8"
        >
          <MagneticButton
            href="#projects"
            className="bg-gradient-accent text-white font-semibold px-7 py-3.5 rounded-full shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center gap-2"
          >
            Lihat Proyek <i className="fas fa-arrow-right text-sm" />
          </MagneticButton>
          <MagneticButton
            href="#contact"
            className="bg-transparent text-text-primary font-semibold px-7 py-3.5 rounded-full border border-border hover:border-accent hover:text-accent hover:-translate-y-0.5 transition-all duration-300"
          >
            Hubungi Saya
          </MagneticButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex gap-5"
        >
          {[
            { icon: 'fab fa-github', url: 'https://github.com/Miyzwan' },
            {
              icon: 'fab fa-linkedin',
              url: 'https://linkedin.com/in/miyzwan',
            },
            { icon: 'fab fa-twitter', url: 'https://twitter.com/miyzwann' },
          ].map((social) => (
            <a
              key={social.url}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-full border border-border flex items-center justify-center text-text-secondary hover:border-accent hover:text-accent hover:-translate-y-1 transition-all duration-300"
            >
              <i className={social.icon} />
            </a>
          ))}
        </motion.div>
      </motion.div>
    </motion.section>
  )
}
