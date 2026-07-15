'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function Footer() {
  const socialRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    // Existing social icons bounce animation
    const ctx = gsap.context(() => {
      const icons = socialRef.current?.querySelectorAll('a')
      if (icons?.length) {
        icons.forEach((icon, i) => {
          icon.style.animation = `social-bounce 1.6s ease-in-out ${i * 0.15}s infinite`
        })
      }

      // Social icons — subtle Z-axis shift on scroll
      const icons2 = socialRef.current?.querySelectorAll('a')
      icons2?.forEach((icon) => {
        gsap.to(icon, {
          scrollTrigger: {
            trigger: icon,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
          translateZ: 20,
          ease: 'power1.out',
        })
      })

      // Text section — gentle 3D depth parallax
      if (textRef.current) {
        gsap.to(textRef.current, {
          scrollTrigger: {
            trigger: textRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
          translateZ: 15,
          ease: 'power1.out',
        })
      }

      // Footer container itself — subtle 3D perspective
      gsap.to('footer', {
        scrollTrigger: {
          trigger: 'footer',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
        transform: 'perspective(1000px) translateZ(5px)',
        ease: 'power1.out',
      })
    })

    return () => ctx.revert()
  }, [])
  return (
    <footer className="relative z-1 border-t border-border py-10">
      <div className="max-w-6xl mx-auto px-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div ref={textRef}>
            <h3 className="text-xl font-extrabold text-gradient mb-3">
              &lt; ML &amp; Web Dev /&gt;
            </h3>
            <p className="text-text-muted text-sm leading-relaxed">
              Membangun solusi cerdas dan aplikasi web yang scalable.
            </p>
          </div>
          <div>
            <h4 className="text-text-primary font-semibold mb-4">Navigasi</h4>
            <div className="flex flex-col gap-2">
              {['Beranda', 'Tentang', 'Proyek', 'Kontak'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '')}`}
                  className="text-text-muted text-sm hover:text-accent transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-text-primary font-semibold mb-4">Media Sosial</h4>
            <div ref={socialRef} className="flex gap-4">
              {[
                { icon: 'fab fa-github', url: 'https://github.com/Miyzwan' },
                { icon: 'fab fa-linkedin', url: 'https://linkedin.com/in/miyzwan' },
                { icon: 'fab fa-twitter', url: 'https://twitter.com/miyzwann' },
              ].map((social) => (
                <a
                  key={social.url}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full border border-border flex items-center justify-center text-text-secondary hover:border-accent hover:text-accent hover:-translate-y-1 transition-all duration-300"
                >
                  <i className={social.icon} />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-border pt-6 text-center">
          <p className="text-text-muted text-sm">
            &copy; {new Date().getFullYear()} Dimas Dwi Ismaunnizam. Made with{' '}
            <span className="text-danger">❤</span> in Indonesia.
          </p>
        </div>
      </div>
    </footer>
  )
}
