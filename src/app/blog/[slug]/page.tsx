import React from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getBlogBySlug } from '@/lib/db'
import BlogDetailClient from '@/components/blog/BlogDetailClient'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const blog = await getBlogBySlug(slug)
  if (!blog) return { title: 'Blog tidak ditemukan' }
  return {
    title: `${blog.title} — Blog Dimas Dwi Ismaunnizam`,
    description: blog.excerpt,
  }
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params
  const blog = await getBlogBySlug(slug)
  if (!blog) notFound()

  return (
    <main className="pt-[120px] pb-[60px] min-h-screen">
      <BlogDetailClient blog={blog} />
    </main>
  )
}
