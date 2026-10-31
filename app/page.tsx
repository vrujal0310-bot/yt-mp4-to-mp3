import { Converter } from '@/components/converter'
import { Faq } from '@/components/faq'
import { RemixStudio } from '@/components/remix-studio'
import { Devices, Formats, HowItWorks } from '@/components/info-sections'

const nav = [
  { href: '#how', label: 'How it works' },
  { href: '#formats', label: 'Quality' },
  { href: '#remix', label: 'Tone+' },
  { href: '#faq', label: 'FAQ' },
]

export default function Page() {
  return (
    <>
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <a href="/" className="flex items-center gap-2 font-heading text-xl font-bold tracking-tight">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-sm text-primary-foreground">
            T
          </span>
          Tone
        </a>
        <nav aria-label="Main">
          <ul className="flex items-center gap-5 text-sm text-muted-foreground">
            {nav.map((item) => (
              <li key={item.href} className="hidden sm:block">
                <a href={item.href} className="transition-colors hover:text-foreground">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pt-8 pb-20 md:grid-cols-2 md:pt-16">
          <div className="flex flex-col gap-6">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">MP3 Converter · 320kbps</p>
            <h1 className="font-heading text-5xl font-extrabold leading-none tracking-tight text-balance md:text-6xl">
              Studio-grade MP3s, straight from your browser.
            </h1>
            <p className="max-w-md text-lg leading-relaxed text-muted-foreground text-pretty">
              Turn any audio or video file you own into a 320kbps MP3. No ads, no sign-ups, no uploads —
              everything is encoded on your device.
            </p>
          </div>
          <Converter />
        </section>

        <HowItWorks />
        <Formats />
        <RemixStudio />
        <Devices />
        <Faq />
      </main>

      <footer className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-10 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <span>© 2026 Tone. Convert only content you own or have rights to.</span>
        <span>Encoded locally with LAME.</span>
      </footer>
    </>
  )
}
