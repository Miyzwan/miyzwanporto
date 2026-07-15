'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login gagal')
        return
      }

      localStorage.setItem('admin_token', data.token)
      localStorage.setItem('admin_username', data.username)
      router.push('/admin/dashboard')
    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[400px]"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gradient mb-2">
            Admin Panel
          </h1>
          <p className="text-text-muted text-sm">
            Masuk untuk mengelola portfolio
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-bg-card border border-border rounded-2xl p-8 space-y-5"
        >
          {error && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-danger text-sm bg-danger/10 p-3 rounded-lg"
            >
              {error}
            </motion.p>
          )}

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-bg-primary border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
              placeholder="Masukkan username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-bg-primary border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
              placeholder="Masukkan password"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-accent text-white font-semibold py-3 rounded-xl shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 transition-all duration-300 disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
