'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'motion/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ProjectCard3D from './ProjectCard3D'
import type { Project } from '@/lib/types'

function ProjectCard({
  project,
  index,
}: {
  project: Project
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
        delay: index * 0.1,
      }}
      whileHover={{ y: -8 }}
      className="bg-bg-card rounded-xl overflow-hidden border border-border transition-colors duration-300 hover:border-accent/50 hover:shadow-xl hover:shadow-accent/10 group"
    >
      <ProjectCard3D className="relative aspect-[16/10] overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-bg-primary/70 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-full bg-gradient-accent flex items-center justify-center text-white hover:scale-110 transition-transform"
              title="Live Demo"
            >
              <i className="fas fa-external-link-alt" />
            </a>
          )}
          {project.sourceUrl && (
            <a
              href={project.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-full bg-gradient-accent flex items-center justify-center text-white hover:scale-110 transition-transform"
              title="Source Code"
            >
              <i className="fab fa-github" />
            </a>
          )}
        </div>
      </ProjectCard3D>
      <div className="p-5">
        <span className="text-xs font-semibold text-accent-light uppercase tracking-wider">
          {project.category}
        </span>
        <h3 className="text-lg font-bold mt-1 mb-2">{project.title}</h3>
        <p className="text-sm text-text-muted leading-relaxed mb-4">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="text-xs px-3 py-1 rounded-full bg-bg-primary text-text-muted border border-border"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
  }, [])

  useEffect(() => {
    if (loading) return
    const ctx = gsap.context(() => {
      const cards = gridRef.current?.querySelectorAll(':scope > div')
      if (cards?.length) {
        // Existing enter animation — keep as-is
        gsap.from(cards, {
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
          scale: 0.95,
          rotation: 3,
          opacity: 0,
          stagger: 0.1,
          duration: 0.6,
          ease: 'power2.out',
        })

        // 3D rotateY reveal + scroll-through depth
        cards.forEach((card) => {
          gsap.fromTo(
            card,
            { rotateY: 15, transformPerspective: 1000 },
            {
              scrollTrigger: {
                trigger: card,
                start: 'top 75%',
                end: 'top 30%',
                scrub: 1.2,
              },
              rotateY: 0,
              ease: 'power1.out',
            }
          )

          // Scroll-through translateZ shift
          gsap.to(card, {
            scrollTrigger: {
              trigger: card,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
            translateZ: 30,
            ease: 'power1.out',
          })
        })
      }
    })
    return () => ctx.revert()
  }, [loading])

  useEffect(() => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => {
        setProjects(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered =
    filter === 'all'
      ? projects
      : projects.filter((p) => p.category === filter)

  const categories = [
    'all',
    ...new Set(projects.map((p) => p.category)),
  ]

  return (
    <section id="projects" ref={ref}>
      <div className="max-w-6xl mx-auto px-5">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center text-3xl sm:text-4xl font-extrabold mb-[60px] relative after:block after:w-[60px] after:h-1 after:bg-gradient-accent after:mx-auto after:mt-4 after:rounded"
        >
          Proyek <span className="text-gradient">Terbaru</span>
        </motion.h2>

        {/* Filters */}
        <div className="flex justify-center gap-3 mb-10 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium cursor-pointer transition-all duration-300 ${
                filter === cat
                  ? 'bg-gradient-accent text-white border-transparent'
                  : 'bg-transparent text-text-secondary border border-border hover:border-accent hover:text-accent'
              }`}
            >
              {cat === 'all' ? 'Semua' : cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-bg-card rounded-xl overflow-hidden border border-border animate-pulse"
              >
                <div className="aspect-[16/10] bg-bg-card-hover" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-20 bg-bg-card-hover rounded" />
                  <div className="h-5 w-3/4 bg-bg-card-hover rounded" />
                  <div className="h-4 w-full bg-bg-card-hover rounded" />
                  <div className="flex gap-2">
                    <div className="h-6 w-14 bg-bg-card-hover rounded-full" />
                    <div className="h-6 w-14 bg-bg-card-hover rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            ref={gridRef}
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}
