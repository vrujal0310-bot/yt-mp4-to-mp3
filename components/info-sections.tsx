const steps = [
  {
    title: 'Pick a file',
    body: 'Drop in any audio or video you own — a phone recording, a podcast export, a band rehearsal, a lecture.',
  },
  {
    title: 'Choose 320kbps',
    body: 'Select the bitrate. 320kbps keeps the most detail; 128kbps makes smaller files for voice.',
  },
  {
    title: 'Download',
    body: 'Encoding runs in your browser. Keep the tab open on mobile, then save your MP3.',
  },
]

const formats = [
  { label: '320kbps', note: 'Highest MP3 quality. Best for music and archiving.' },
  { label: '192kbps', note: 'A good middle ground for mixed content.' },
  { label: '128kbps', note: 'Small files for speech, podcasts and audiobooks.' },
]

const devices = [
  { name: 'iPhone', body: 'Tap Download MP3, then "Save to Files" to keep it locally.' },
  { name: 'Android', body: 'Files land in Downloads and appear in your music app.' },
  { name: 'Desktop', body: 'Every modern browser on Windows, macOS and Linux saves MP3 natively.' },
]

const tips = [
  "File won't load? Some rare codecs aren't supported by your browser — try exporting to WAV or MP4 first.",
  'Very long files use more memory. Close other heavy tabs for multi-hour recordings.',
  "320kbps won't restore detail that isn't in the source — a low-quality original stays low quality.",
]

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto w-full max-w-6xl px-5 py-20">
      <h2 className="font-heading text-3xl font-bold tracking-tight text-balance md:text-4xl">
        How to convert to MP3 320kbps
      </h2>
      <ol className="mt-10 grid gap-8 md:grid-cols-3">
        {steps.map((step, i) => (
          <li key={step.title} className="flex flex-col gap-3 border-t-2 border-foreground pt-5">
            <span className="font-mono text-sm text-primary">Step {i + 1}</span>
            <h3 className="font-heading text-xl font-semibold">{step.title}</h3>
            <p className="leading-relaxed text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function Formats() {
  return (
    <section id="formats" className="bg-card">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-20 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-balance md:text-4xl">
            Supported quality
          </h2>
          <p className="leading-relaxed text-muted-foreground text-pretty">
            We encode with the LAME MP3 engine at a constant bitrate, preserving what&apos;s in your source
            without adding audible artifacts. Input can be almost any format your browser can play.
          </p>
        </div>
        <ul className="flex flex-col">
          {formats.map((f) => (
            <li key={f.label} className="flex items-baseline gap-6 border-b py-5 first:pt-0">
              <span className="w-24 shrink-0 font-heading text-2xl font-bold tabular-nums">{f.label}</span>
              <span className="leading-relaxed text-muted-foreground">{f.note}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function Devices() {
  return (
    <section id="devices" className="mx-auto w-full max-w-6xl px-5 py-20">
      <h2 className="font-heading text-3xl font-bold tracking-tight text-balance md:text-4xl">
        Works on any device
      </h2>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {devices.map((d) => (
          <div key={d.name} className="flex flex-col gap-2 rounded-xl bg-card p-6">
            <h3 className="font-heading text-lg font-semibold">{d.name}</h3>
            <p className="leading-relaxed text-muted-foreground">{d.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-16 flex flex-col gap-4">
        <h3 className="font-heading text-2xl font-bold">Troubleshooting</h3>
        <ul className="flex flex-col gap-3">
          {tips.map((tip) => (
            <li key={tip} className="flex gap-3 leading-relaxed text-muted-foreground">
              <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
