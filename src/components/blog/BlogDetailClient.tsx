'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { BlogPost } from '@/lib/types'

export default function BlogDetailClient({ blog }: { blog: BlogPost }) {
  const contentRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      // Article content — subtle 3D perspective as user scrolls
      if (contentRef.current) {
        gsap.to(contentRef.current, {
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
          transform: 'perspective(1200px) translateZ(15px)',
          ease: 'power1.out',
        })
      }

      // Back button + header — slight depth parallax
      if (headerRef.current) {
        gsap.to(headerRef.current, {
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
          translateZ: 25,
          ease: 'power1.out',
        })
      }
    })

    return () => ctx.revert()
  }, [])
  return (
    <article className="max-w-3xl mx-auto px-5">
      <motion.div
        ref={headerRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition-colors mb-4"
        >
          <i className="fas fa-home" />
          Kembali ke Dashboard
        </Link>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition-colors mb-8"
        >
          <i className="fas fa-arrow-left" />
          Kembali ke Blog
        </Link>

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

        <h1 className="text-3xl sm:text-4xl font-extrabold mt-3 mb-6 leading-tight">
          {blog.title}
        </h1>

        <div className="flex items-center gap-4 pb-6 border-b border-border mb-8 text-sm text-text-muted">
          <span className="flex items-center gap-2">
            <i className="fas fa-user-circle text-accent" />
            Dimas Dwi Ismaunnizam
          </span>
        </div>
      </motion.div>

      <div
        ref={contentRef}
        className="prose prose-invert max-w-none
          prose-headings:text-text-primary prose-headings:font-bold
          prose-p:text-text-secondary prose-p:leading-relaxed
          prose-a:text-accent hover:prose-a:text-accent-light
          prose-strong:text-text-primary
          prose-code:text-accent-light prose-code:bg-bg-card prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
          prose-pre:bg-bg-card prose-pre:border prose-pre:border-border
          prose-img:rounded-xl prose-img:border prose-img:border-border
          prose-blockquote:border-accent prose-blockquote:text-text-muted
          prose-li:text-text-secondary"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />
    </article>
  )
}
