'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import type { BlogPost } from '@/lib/types'

export default function BlogSection() {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const cardsContainerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(titleRef, { once: true, margin: '-100px' })

  useEffect(() => {
    fetch('/api/blogs')
      .then((res) => res.json())
      .then((data) => {
        const sorted = (data as BlogPost[])
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 6)
        setBlogs(sorted)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (loading || blogs.length === 0) return
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      const cards = cardsContainerRef.current?.querySelectorAll('.blog-card')

      // — Section decorative bar: fills on scroll —
      gsap.to('.blog-bar', {
        scaleX: 1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          end: 'bottom 30%',
          scrub: 1,
        },
        ease: 'none',
      })

      // — Card staggered reveal (single timeline per card, force3D) —
      cards?.forEach((card, i) => {
        const fromLeft = i % 2 === 0
        const direction = fromLeft ? -1 : 1

        // Merge reveal + float into one ScrollTrigger → fewer instances
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            end: 'center 30%',
            scrub: 1.2,
          },
          defaults: { force3D: true },
        })

        tl.fromTo(
          card,
          {
            x: direction * 80,
            y: 40,
            scale: 0.92,
            opacity: 0,
          },
          {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            ease: 'power2.out',
            duration: 0.7,
          }
        )
          .to(
            card,
            {
              y: -8,
              ease: 'sine.out',
              duration: 0.3,
            },
            '-=0.1'
          )
      })
    })

    return () => ctx.revert()
  }, [loading, blogs.length])

  return (
    <section id="blog" ref={sectionRef}>
      <div className="max-w-6xl mx-auto px-5">
        {/* ── Section Header ── */}
        <motion.h2
          ref={titleRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center text-3xl sm:text-4xl font-extrabold mb-[60px] relative after:block after:w-[60px] after:h-1 after:bg-gradient-accent after:mx-auto after:mt-4 after:rounded"
        >
          <span className="text-gradient">Blog</span>
        </motion.h2>

        {/* ── Scroll progress decorative bar ── */}
        <div className="h-1 w-full bg-border/20 rounded-full mb-10 overflow-hidden">
          <div className="blog-bar h-full w-full bg-gradient-accent rounded-full origin-left scale-x-0" />
        </div>

        {/* ── Cards Container (always mounted so GSAP ref works) ── */}
        <div ref={cardsContainerRef}>
          {loading ? (
            <div className="space-y-16">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="max-w-2xl mx-auto bg-bg-card/75 border border-border/50 rounded-2xl p-8 animate-pulse"
                >
                  <div className="h-4 w-32 bg-bg-card-hover rounded mb-4" />
                  <div className="h-8 w-3/4 bg-bg-card-hover rounded mb-3" />
                  <div className="h-4 w-full bg-bg-card-hover rounded mb-2" />
                  <div className="h-4 w-2/3 bg-bg-card-hover rounded" />
                </div>
              ))}
            </div>
          ) : blogs.length === 0 ? (
            /* ── Empty State ── */
            <div className="text-center py-20 text-text-muted">
              <i className="fas fa-pen-alt text-4xl mb-4 block" />
              <p>Belum ada artikel blog.</p>
            </div>
          ) : (
            /* ── Staggered Cards ── */
            <div className="relative space-y-24">
              {blogs.map((blog, i) => (
                <div key={blog.slug} className="max-w-2xl mx-auto blog-card will-change-transform">
                  <Link
                    href={`/blog/${blog.slug}`}
                    className="group relative block bg-bg-card/75 border border-border/50 rounded-2xl p-8 overflow-hidden transition-colors duration-500 hover:border-accent/30 hover:bg-bg-card/90"
                  >
                    {/* Vertical gradient accent bar — left side */}
                    <div className="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-gradient-accent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Hover glow overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

                    {/* Content */}
                    <div className="relative z-10">
                      {/* Date badge + Category tag */}
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-xs text-text-muted">
                          {new Date(blog.createdAt).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                        {blog.category && (
                          <span className="text-[10px] tracking-widest text-accent-light font-semibold uppercase bg-accent/10 px-2.5 py-1 rounded-full">
                            {blog.category}
                          </span>
                        )}
                      </div>

                      {/* Title — gradient text */}
                      <h3 className="text-2xl sm:text-3xl font-extrabold mb-3 text-gradient">
                        {blog.title}
                      </h3>

                      {/* Excerpt — 2-line clamp */}
                      <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
                        {blog.excerpt || blog.content.substring(0, 200) + '...'}
                      </p>

                      {/* Baca Selengkapnya */}
                      <div className="flex items-center gap-2 mt-6 text-accent-light text-sm font-medium group/link">
                        <span>Baca Selengkapnya</span>
                        <span className="inline-block transition-transform duration-300 group-hover/link:translate-x-1">
                          →
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
