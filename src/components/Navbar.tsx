'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Link from 'next/link'
import ThemeToggle from './ThemeToggle'

const navLinks = [
  { href: '#hero', label: 'Beranda' },
  { href: '#about', label: 'Tentang' },
  { href: '#projects', label: 'Proyek' },
  { href: '#blog', label: 'Blog' },
  { href: '#contact', label: 'Kontak' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleClick = (href: string) => {
    setMobileOpen(false)
    if (href.startsWith('#')) {
      const el = document.querySelector(href)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-bg-primary/85 backdrop-blur-xl border-b border-accent/10 shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 h-[70px] flex items-center justify-between">
        <Link
          href="#hero"
          onClick={() => handleClick('#hero')}
          className="text-xl font-extrabold text-gradient"
        >
          &lt; MIYZWAN /&gt;
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-4 list-none">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={(e) => {
                  e.preventDefault()
                  handleClick(link.href)
                }}
                className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors relative after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:bg-gradient-accent after:transition-all after:duration-300 after:w-0 hover:after:w-full"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <ThemeToggle />
          </li>
        </ul>

        {/* Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex flex-col gap-[5px] p-[5px] cursor-pointer bg-transparent border-none"
          aria-label="Toggle navigation"
        >
          <motion.span
            animate={mobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
            className="w-6 h-[2px] bg-text-primary rounded block"
          />
          <motion.span
            animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
            className="w-6 h-[2px] bg-text-primary rounded block"
          />
          <motion.span
            animate={mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
            className="w-6 h-[2px] bg-text-primary rounded block"
          />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-bg-primary/95 backdrop-blur-xl border-b border-accent/10 overflow-hidden"
          >
            <ul className="list-none flex flex-col p-5 gap-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault()
                      handleClick(link.href)
                    }}
                    className="text-base font-medium text-text-secondary hover:text-accent transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <ThemeToggle />
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
