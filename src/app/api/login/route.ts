import { NextResponse } from 'next/server'
import { login } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()
    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password wajib diisi' }, { status: 400 })
    }
    const token = await login(username, password)
    if (!token) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 })
    }
    return NextResponse.json({ token, username })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
