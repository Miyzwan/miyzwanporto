'use client'

import { useRef, useEffect } from 'react'
import { motion, useInView } from 'motion/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const mlSkills = [
  { name: 'Python', level: 90 },
  { name: 'Scikit-learn', level: 88 },
  { name: 'TensorFlow', level: 85 },
  { name: 'PyTorch', level: 82 },
]

const webSkills = [
  { name: 'JavaScript', level: 88 },
  { name: 'Tailwind CSS', level: 86 },
  { name: 'Bootstrap', level: 84 },
  { name: 'PHP', level: 80 },
]

const iosSkills = [
  { name: 'Swift', level: 88 },
  { name: 'SwiftUI', level: 85 },
  { name: 'UIKit', level: 82 },
  { name: 'Xcode', level: 80 },
]

const educationData = [
  { date: '2022 \u2014 2026', title: 'Binus University', subtitle: 'Computer Science' },
  { date: '2020 \u2014 2022', title: 'SMAN 1 Bandung', subtitle: 'IPA' },
]

const experienceData = [
  { date: '2024 \u2014 Sekarang', title: 'ML Engineer', subtitle: '[Coming Soon]' },
  { date: '2023 \u2014 2024', title: 'Web Developer', subtitle: '[Coming Soon]' },
]

const techStack = [
  { name: 'Python', icon: 'fa-brands fa-python' },
  { name: 'JavaScript', icon: 'fa-brands fa-js' },
  { name: 'TypeScript', icon: 'fa-solid fa-code' },
  { name: 'React', icon: 'fa-brands fa-react' },
  { name: 'Next.js', icon: 'fa-solid fa-file-code' },
  { name: 'TensorFlow', icon: 'fa-solid fa-brain' },
  { name: 'PyTorch', icon: 'fa-solid fa-fire' },
  { name: 'Docker', icon: 'fa-brands fa-docker' },
  { name: 'AWS', icon: 'fa-brands fa-aws' },
  { name: 'Git', icon: 'fa-brands fa-git-alt' },
  { name: 'Figma', icon: 'fa-brands fa-figma' },
  { name: 'Firebase', icon: 'fa-solid fa-database' },
]

/* -------------------------------------------------------------------------- */
/*  Circular Progress Ring                                                     */
/* -------------------------------------------------------------------------- */
function CircularProgressRing({
  name,
  level,
  index,
}: {
  name: string
  level: number
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const countRef = useRef<HTMLSpanElement>(null)

  const radius = 45
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - level / 100)
  const gradientId = `ring-${name.replace(/[\s.]/g, '-')}`

  useEffect(() => {
    if (!isInView || !countRef.current) return
    const tween = gsap.to(countRef.current, {
      innerText: level,
      snap: { innerText: 1 },
      duration: 1.5,
      ease: 'power2.out',
    })
    return () => {
      tween.kill()
    }
  }, [isInView, level])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center gap-2"
    >
      <div className="relative w-[100px] h-[100px]">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          {/* Background track */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="var(--color-bg-card-hover)"
            strokeWidth="6"
          />
          {/* Animated progress ring */}
          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={isInView ? { strokeDashoffset: offset } : {}}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base font-bold text-gradient">
            <span ref={countRef}>0</span>%
          </span>
        </div>
      </div>
      <span className="text-xs sm:text-sm text-text-secondary text-center font-medium">
        {name}
      </span>
    </motion.div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Skill Category Card                                                        */
/* -------------------------------------------------------------------------- */
function SkillCategoryCard({
  icon,
  title,
  skills,
  index,
}: {
  icon: string
  title: string
  skills: { name: string; level: number }[]
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: index * 0.15 }}
      whileHover={{ y: -4 }}
      className="bg-bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 transition-shadow duration-300 hover:shadow-lg hover:shadow-accent/10 hover:border-accent/20"
    >
      <div className="flex items-center gap-3 mb-5">
        <i className={`${icon} text-xl text-accent-light`} />
        <h4 className="text-lg font-bold text-gradient">{title}</h4>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {skills.map((skill, i) => (
          <CircularProgressRing key={skill.name} {...skill} index={i} />
        ))}
      </div>
    </motion.div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Timeline Item                                                              */
/* -------------------------------------------------------------------------- */
function TimelineItem({
  date,
  title,
  subtitle,
  type,
  index,
}: {
  date: string
  title: string
  subtitle: string
  type: 'education' | 'experience'
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const dir = type === 'education' ? -30 : 30

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: dir }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: index * 0.15 }}
      className="relative pl-8 pb-8 last:pb-0"
    >
      {/* Vertical line */}
      <div className="absolute left-[5px] top-3 bottom-0 w-[2px] bg-accent/20 last:hidden" />
      {/* Dot */}
      <div className="absolute left-0 top-[6px] w-3 h-3 rounded-full bg-accent shadow-lg shadow-accent/30 z-10" />
      {/* Card */}
      <div className="glass rounded-xl p-4">
        <span className="text-xs text-accent-light font-medium tracking-wide">{date}</span>
        <h5 className="text-base font-semibold text-text-primary mt-1">{title}</h5>
        <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>
      </div>
    </motion.div>
  )
}

/* -------------------------------------------------------------------------- */
/*  CountUp  (gsap number animation)                                           */
/* -------------------------------------------------------------------------- */
function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const spanRef = useRef<HTMLSpanElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: '-50px' })

  useEffect(() => {
    if (!isInView || !spanRef.current) return
    const tween = gsap.to(spanRef.current, {
      innerText: value,
      snap: { innerText: 1 },
      duration: 1.5,
      ease: 'power2.out',
    })
    return () => {
      tween.kill()
    }
  }, [isInView, value])

  return (
    <div ref={containerRef}>
      <span
        ref={spanRef}
        className="text-3xl sm:text-4xl font-extrabold text-gradient"
      >
        0
      </span>
      <span className="text-3xl sm:text-4xl font-extrabold text-gradient">
        {suffix}
      </span>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Main Component                                                             */
/* -------------------------------------------------------------------------- */

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
}

export default function About() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })
  const skillGridRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const techRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      // Skill cards — subtle 3D tilt on scroll
      const skillCards = skillGridRef.current?.querySelectorAll(':scope > div')
      skillCards?.forEach((card, i) => {
        gsap.to(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
          rotateX: gsap.utils.clamp(-2, 2, (i - 1) * 1.5),
          ease: 'power1.out',
        })
      })

      // Timeline items — translateZ shifting on scroll
      const items = timelineRef.current?.querySelectorAll('.glass')
      items?.forEach((item) => {
        const el = item as HTMLElement
        gsap.to(el, {
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
          transform: 'perspective(1000px) translateZ(20px)',
          ease: 'power1.out',
        })
      })

      // Tech stack badges — subtle depth shift
      const badges = techRef.current?.querySelectorAll('span')
      badges?.forEach((badge) => {
        gsap.to(badge, {
          scrollTrigger: {
            trigger: badge,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
          translateZ: gsap.utils.random(10, 30),
          ease: 'power1.out',
        })
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-24 sm:py-32 relative overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-5 relative z-10">
        {/* ======================================================================== */}
        {/*  Section Header                                                         */}
        {/* ======================================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 sm:mb-20"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight">
            Tentang{' '}
            <span className="text-gradient">Saya</span>
          </h2>
          <div className="mt-4 mx-auto w-16 h-1 rounded-full bg-gradient-accent" />
          <p className="mt-4 text-text-secondary text-sm sm:text-base">
            Get to know the person behind the code
          </p>
        </motion.div>

        {/* ======================================================================== */}
        {/*  Profile Section                                                         */}
        {/* ======================================================================== */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-12 lg:gap-16 items-center mb-24"
        >
          {/* Left — Photo */}
          <motion.div variants={fadeUp} className="relative mx-auto lg:mx-0 w-fit">
            <div className="gradient-border-animated">
              <img
                src="/assets/images/myavatar.png"
                alt="Dimas Dwi Ismaunnizam"
                className="w-[300px] sm:w-[350px] rounded-[inherit]"
              />
            </div>
            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -bottom-3 -right-3 bg-bg-card/80 backdrop-blur border border-border/50 rounded-xl px-4 py-2 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-semibold text-gradient">3+ Years</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right — Bio + Quote + Stats */}
          <motion.div variants={fadeUp}>
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              Hi, I&apos;m{' '}
              <span className="text-gradient">Dimas</span>
            </h3>
            <p className="text-text-secondary leading-relaxed mb-6">
              Saya adalah mahasiswa Computer Science di Binus University yang
              sangat antusias dalam menciptakan solusi cerdas berbasis AI dan
              membangun aplikasi web yang scalable. Dengan pengalaman dalam
              pengembangan model machine learning dan web development, saya
              selalu berusaha menghadirkan teknologi yang berdampak nyata.
            </p>

            {/* Quote block */}
            <div className="bg-bg-card/50 border-l-4 border-accent rounded-r-xl p-5 mb-8">
              <p className="italic text-text-secondary text-sm sm:text-base leading-relaxed">
                &ldquo;Saya percaya bahwa kombinasi antara kecerdasan buatan dan
                pengembangan web yang solid dapat menciptakan solusi yang powerful
                dan accessible bagi banyak orang.&rdquo;
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8">
              {/* Years */}
              <div className="text-center">
                <i className="fa-solid fa-calendar text-accent-light text-lg mb-1" />
                <CountUp value={3} suffix="+" />
                <p className="text-xs text-text-muted mt-1">Years</p>
              </div>
              {/* Projects */}
              <div className="text-center">
                <i className="fa-solid fa-code text-accent-light text-lg mb-1" />
                <CountUp value={15} suffix="+" />
                <p className="text-xs text-text-muted mt-1">Projects</p>
              </div>
              {/* Skills */}
              <div className="text-center">
                <i className="fa-solid fa-layer-group text-accent-light text-lg mb-1" />
                <CountUp value={8} suffix="+" />
                <p className="text-xs text-text-muted mt-1">Skills</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ======================================================================== */}
        {/*  Skill Cards  */}
        {/* ======================================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="mb-24"
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            Keahlian <span className="text-gradient">Teknis</span>
          </h3>
          <div ref={skillGridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkillCategoryCard
              icon="fa-solid fa-brain"
              title="Machine Learning"
              skills={mlSkills}
              index={0}
            />
            <SkillCategoryCard
              icon="fa-solid fa-code"
              title="Web Development"
              skills={webSkills}
              index={1}
            />
            <SkillCategoryCard
              icon="fa-brands fa-apple"
              title="iOS Dev"
              skills={iosSkills}
              index={2}
            />
          </div>
        </motion.div>

        {/* ======================================================================== */}
        {/*  Timeline (Pendidikan + Pengalaman)  */}
        {/* ======================================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="mb-24"
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            Perjalanan <span className="text-gradient">Saya</span>
          </h3>
          <div ref={timelineRef} className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Pendidikan */}
            <div>
              <h4 className="text-lg font-semibold text-accent-light flex items-center gap-2 mb-6">
                <i className="fa-solid fa-graduation-cap" /> Pendidikan
              </h4>
              {educationData.map((item, i) => (
                <TimelineItem key={item.title} {...item} type="education" index={i} />
              ))}
            </div>
            {/* Pengalaman */}
            <div>
              <h4 className="text-lg font-semibold text-accent-light flex items-center gap-2 mb-6">
                <i className="fa-solid fa-briefcase" /> Pengalaman
              </h4>
              {experienceData.map((item, i) => (
                <TimelineItem key={item.title} {...item} type="experience" index={i} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* ======================================================================== */}
        {/*  Tech Stack Badges  */}
        {/* ======================================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          className="text-center"
        >
          <h3 className="text-xl sm:text-2xl font-bold mb-8">
            Tech <span className="text-gradient">Stack</span>
          </h3>
          <div ref={techRef} className="flex flex-wrap justify-center gap-3">
            {techStack.map((tech, i) => (
              <motion.span
                key={tech.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-2 bg-bg-card/50 border border-border/50 rounded-full px-4 py-2 text-sm text-text-secondary font-medium transition-all duration-300 cursor-default hover:bg-accent/10 hover:border-accent/30"
              >
                <i className={tech.icon} />
                {tech.name}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
