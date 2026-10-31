import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
})

export const metadata: Metadata = {
  title: 'Tone — Convert Audio & Video to MP3 320kbps',
  description:
    'Convert your own audio and video files to high-quality MP3 at 128, 192 or 320kbps. Free, ad-free, and processed entirely in your browser.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#f3f4f6',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${bricolage.variable} bg-background`}>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
