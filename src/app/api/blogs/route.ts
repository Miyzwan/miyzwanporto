import { NextResponse } from 'next/server'
import { getBlogs, createBlog } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET() {
  try {
    const blogs = await getBlogs()
    return NextResponse.json(blogs)
  } catch {
    return NextResponse.json({ error: 'Gagal membaca data blogs' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const decoded = verifyToken(authHeader.split(' ')[1])
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await req.json()
    const { title, content } = body
    if (!title || !content) {
      return NextResponse.json({ error: 'Title dan content wajib diisi' }, { status: 400 })
    }

    const blog = await createBlog(body)
    return NextResponse.json(blog, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Gagal menambah blog' }, { status: 500 })
  }
}
