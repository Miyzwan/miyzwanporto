'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') !== 'light'
    }
    return true
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const toggle = () => {
    const next = !dark
    setDark(next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggle}
      className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-secondary hover:border-accent hover:text-accent transition-all"
      aria-label="Toggle theme"
    >
      <i className={`${dark ? 'fa-solid fa-moon' : 'fa-solid fa-sun'} text-sm`} />
    </button>
  )
}
