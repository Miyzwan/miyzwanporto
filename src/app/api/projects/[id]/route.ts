import { NextResponse } from 'next/server'
import { getProjectById, updateProject, deleteProject } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const project = await getProjectById(parseInt(id))
    if (!project) {
      return NextResponse.json({ error: 'Project tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json(project)
  } catch {
    return NextResponse.json({ error: 'Gagal membaca data project' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const decoded = verifyToken(authHeader.split(' ')[1])
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const updated = await updateProject(parseInt(id), body)
    if (!updated) {
      return NextResponse.json({ error: 'Project tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Gagal mengupdate project' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const decoded = verifyToken(authHeader.split(' ')[1])
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { id } = await params
    const deleted = await deleteProject(parseInt(id))
    if (!deleted) {
      return NextResponse.json({ error: 'Project tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Project berhasil dihapus', project: deleted })
  } catch {
    return NextResponse.json({ error: 'Gagal menghapus project' }, { status: 500 })
  }
}
