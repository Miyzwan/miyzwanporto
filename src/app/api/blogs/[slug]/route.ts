import { NextResponse } from 'next/server'
import { getBlogBySlug, updateBlog, deleteBlog } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const blog = await getBlogBySlug(slug)
    if (!blog) {
      return NextResponse.json({ error: 'Blog tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json(blog)
  } catch {
    return NextResponse.json({ error: 'Gagal membaca data blog' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const decoded = verifyToken(authHeader.split(' ')[1])
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { slug } = await params
    const body = await req.json()
    const updated = await updateBlog(slug, body)
    if (!updated) {
      return NextResponse.json({ error: 'Blog tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Gagal mengupdate blog' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const decoded = verifyToken(authHeader.split(' ')[1])
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { slug } = await params
    const deleted = await deleteBlog(slug)
    if (!deleted) {
      return NextResponse.json({ error: 'Blog tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Blog berhasil dihapus', blog: deleted })
  } catch {
    return NextResponse.json({ error: 'Gagal menghapus blog' }, { status: 500 })
  }
}
