import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getAdmin } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'ios-portfolio-secret-key-2025'

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(username: string): string {
  return jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' })
}

export async function login(username: string, password: string) {
  const admin = await getAdmin()
  if (!admin || username !== admin.username) return null
  const valid = await verifyPassword(password, admin.password)
  if (!valid) return null
  return generateToken(username)
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { username: string }
  } catch {
    return null
  }
}
