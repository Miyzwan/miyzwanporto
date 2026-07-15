import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import SmoothScroll from '@/components/SmoothScroll'
import AppShell from '@/components/AppShell'
import ScrollProgressProvider from '@/components/ScrollProgressProvider'
import Scroll3DWrapper from '@/components/Scroll3DWrapper'
import Scene3DFixed from '@/components/Scene3DFixed'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Dimas Dwi Ismaunnizam — ML & Web Developer',
  description: 'Portfolio of Dimas Dwi Ismaunnizam — Machine Learning & Web Developer based in Jakarta, Indonesia. Specializing in AI, deep learning, and scalable web applications.',
  keywords: ['portfolio', 'machine learning', 'web developer', 'iOS', 'AI', 'Indonesia'],
  openGraph: {
    title: 'Dimas Dwi Ismaunnizam — ML & Web Developer',
    description: 'Machine Learning & Web Developer passionate about AI and scalable web applications.',
    type: 'website',
    locale: 'id_ID',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('theme');
                if (theme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            })();
          `,
        }} />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <ScrollProgressProvider>
          <Scene3DFixed />
          <SmoothScroll>
            <Scroll3DWrapper>
              <AppShell>{children}</AppShell>
            </Scroll3DWrapper>
          </SmoothScroll>
        </ScrollProgressProvider>
      </body>
    </html>
  )
}
