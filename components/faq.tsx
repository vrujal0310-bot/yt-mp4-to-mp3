import { Plus } from 'lucide-react'

const faqs = [
  {
    q: 'Does 320kbps always sound better than 128kbps?',
    a: 'Generally yes, especially for music, because 320kbps preserves more detail. If the original is low quality, a higher bitrate won’t recover what’s missing.',
  },
  {
    q: 'Are my files uploaded anywhere?',
    a: 'No. Decoding and MP3 encoding happen entirely in your browser. Nothing is sent to a server.',
  },
  {
    q: 'Is it free?',
    a: 'Yes — free, ad-free, no sign-up and no installation.',
  },
  {
    q: 'Will it work on iPhone and Android?',
    a: 'Yes. On iPhone, save via “Save to Files”. On Android, MP3s go to your Downloads folder.',
  },
  {
    q: 'Can I convert very long recordings?',
    a: 'Yes, though longer files take more time and memory. Keep the tab active until it finishes.',
  },
  {
    q: 'What can I legally convert?',
    a: 'Only content you own or have permission to use. Respect copyright and the terms of any platform you got the file from.',
  },
]

export function Faq() {
  return (
    <section id="faq" className="bg-card">
      <div className="mx-auto w-full max-w-3xl px-5 py-20">
        <h2 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">Questions</h2>
        <div className="mt-8 flex flex-col">
          {faqs.map((item) => (
            <details key={item.q} className="group border-b py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                {item.q}
                <Plus
                  className="size-4 shrink-0 text-primary transition-transform group-open:rotate-45"
                  aria-hidden="true"
                />
              </summary>
              <p className="mt-3 leading-relaxed text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
