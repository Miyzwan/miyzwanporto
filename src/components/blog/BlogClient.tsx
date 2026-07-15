'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'motion/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import type { BlogPost } from '@/lib/types'

export default function BlogClient() {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const articlesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/blogs')
      .then((res) => res.json())
      .then((data) => {
        setBlogs(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (loading || blogs.length === 0) return
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      const articles = articlesRef.current?.querySelectorAll('article')
      articles?.forEach((article) => {
        gsap.fromTo(
          article,
          { rotateY: 10, transformPerspective: 1000 },
          {
            scrollTrigger: {
              trigger: article,
              start: 'top 75%',
              end: 'top 30%',
              scrub: 1.2,
            },
            rotateY: 0,
            ease: 'power1.out',
          }
        )
      })
    })

    return () => ctx.revert()
  }, [loading, blogs.length])

  return (
    <section ref={ref} className="max-w-4xl mx-auto px-5">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition-colors mb-8"
      >
        <i className="fas fa-arrow-left" />
        Kembali ke Beranda
      </Link>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-3xl sm:text-4xl font-extrabold text-center mb-[60px] after:block after:w-[60px] after:h-1 after:bg-gradient-accent after:mx-auto after:mt-4 after:rounded"
      >
        <span className="text-gradient">Blog</span>
      </motion.h1>

      {loading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-bg-card rounded-xl p-6 border border-border animate-pulse"
            >
              <div className="h-4 w-24 bg-bg-card-hover rounded mb-3" />
              <div className="h-6 w-3/4 bg-bg-card-hover rounded mb-2" />
              <div className="h-4 w-full bg-bg-card-hover rounded" />
            </div>
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-20 text-text-muted">
          <i className="fas fa-pen-alt text-4xl mb-4 block" />
          <p>Belum ada artikel blog.</p>
        </div>
      ) : (
        <div ref={articlesRef} className="space-y-6">
          {blogs.map((blog, i) => (
            <motion.article
              key={blog.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Link
                href={`/blog/${blog.slug}`}
                className="block group bg-bg-card rounded-xl p-6 border border-border hover:border-accent/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10"
              >
                <span className="text-xs text-text-muted">
                  {new Date(blog.createdAt).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                {blog.category && (
                  <span className="ml-3 text-xs text-accent-light font-semibold uppercase">
                    {blog.category}
                  </span>
                )}
                <h2 className="text-xl font-bold mt-2 mb-2 group-hover:text-accent transition-colors">
                  {blog.title}
                </h2>
                <p className="text-sm text-text-muted leading-relaxed">
                  {blog.excerpt || blog.content.substring(0, 200) + '...'}
                </p>
                <div className="flex items-center gap-2 mt-4 text-accent text-sm font-medium">
                  Baca Selengkapnya <i className="fas fa-arrow-right text-xs" />
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      )}
    </section>
  )
}
