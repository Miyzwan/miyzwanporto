'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'motion/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function Contact() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const infoRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      // Contact info cards — 3D parallax in Z space
      const cards = infoRef.current?.querySelectorAll(':scope > div')
      cards?.forEach((card, i) => {
        gsap.to(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
          translateZ: (i % 2 === 0 ? 15 : 25),
          ease: 'power1.out',
        })
      })

      // Form — subtle rotateX based on scroll
      if (formRef.current) {
        gsap.to(formRef.current, {
          scrollTrigger: {
            trigger: formRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
          rotateX: 1.5,
          ease: 'power1.out',
        })
      }
    })

    return () => ctx.revert()
  }, [])
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  const contactItems = [
    {
      icon: 'fas fa-envelope',
      label: 'Email',
      value: 'dimas.ismaunnizam@binus.ac.id',
    },
    { icon: 'fas fa-phone', label: 'Telepon', value: '+62 852 2516 0502' },
    {
      icon: 'fas fa-map-marker-alt',
      label: 'Lokasi',
      value: 'Jakarta, Indonesia',
    },
    { icon: 'fab fa-github', label: 'GitHub', value: 'github.com/Miyzwan' },
  ]

  return (
    <section id="contact" ref={ref}>
      <div className="max-w-6xl mx-auto px-5">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center text-3xl sm:text-4xl font-extrabold mb-[60px] relative after:block after:w-[60px] after:h-1 after:bg-gradient-accent after:mx-auto after:mt-4 after:rounded"
        >
          Hubungi <span className="text-gradient">Saya</span>
        </motion.h2>

        <div
          className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12"
          style={{ perspective: '1200px' }}
        >
          {/* Contact Info */}
          <motion.div
            ref={infoRef}
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            {contactItems.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex items-center gap-4 p-4 rounded-xl bg-bg-card border border-border"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-accent flex items-center justify-center text-white shrink-0">
                  <i className={item.icon} />
                </div>
                <div>
                  <h4 className="text-sm text-text-muted">{item.label}</h4>
                  <p className="text-text-primary font-medium">{item.value}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Form */}
          <motion.form
            ref={formRef}
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.2,
            }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="text"
              placeholder="Nama Anda"
              required
              className="w-full px-5 py-3.5 rounded-xl bg-bg-card border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors duration-300"
            />
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="email"
              placeholder="Email Anda"
              required
              className="w-full px-5 py-3.5 rounded-xl bg-bg-card border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors duration-300"
            />
            <motion.textarea
              whileFocus={{ scale: 1.01 }}
              rows={5}
              placeholder="Pesan Anda"
              required
              className="w-full px-5 py-3.5 rounded-xl bg-bg-card border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors duration-300 resize-none"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-gradient-accent text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 transition-all duration-300 cursor-pointer"
            >
              {submitted ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="fas fa-check" /> Pesan Terkirim!
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Kirim Pesan <i className="fas fa-paper-plane" />
                </span>
              )}
            </motion.button>
          </motion.form>
        </div>
      </div>
    </section>
  )
}
