import React from 'react'
import type { Metadata } from 'next'
import BlogClient from '@/components/blog/BlogClient'

export const metadata: Metadata = {
  title: 'Blog — Dimas Dwi Ismaunnizam',
  description: 'Tulisan dan artikel tentang machine learning, web development, dan teknologi.',
}

export default function BlogPage() {
  return (
    <main className="pt-[120px] pb-[60px] min-h-screen">
      <BlogClient />
    </main>
  )
}
