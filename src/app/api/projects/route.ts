import { NextResponse } from 'next/server'
import { getProjects, createProject } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET() {
  try {
    const projects = await getProjects()
    return NextResponse.json(projects)
  } catch {
    return NextResponse.json({ error: 'Gagal membaca data projects' }, { status: 500 })
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
    const { title, description } = body
    if (!title || !description) {
      return NextResponse.json({ error: 'Title dan description wajib diisi' }, { status: 400 })
    }

    const project = await createProject(body)
    return NextResponse.json(project, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Gagal menambah project' }, { status: 500 })
  }
}
