'use client'

import { useEffect, useRef, useState } from 'react'
import { Lock, Music2, Play, Sparkles } from 'lucide-react'
import { startPremiumCheckout } from '@/app/actions/stripe'
import { Button } from '@/components/ui/button'

const modes = [
  { id: 'clean', label: 'Clean', note: 'Original character' },
  { id: 'lofi', label: 'Lo-fi', note: 'Warm & dusty' },
  { id: 'speed', label: 'Speed up', note: '1.25× energy' },
  { id: 'slow', label: 'Slow down', note: '0.75× dreamy' },
] as const

export function RemixStudio() {
  const [mode, setMode] = useState<(typeof modes)[number]['id']>('lofi')
  const [active, setActive] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [loadingSource, setLoadingSource] = useState(false)
  const [sourceError, setSourceError] = useState('')
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (!previewFile) {
      setPreviewUrl('')
      return
    }
    const url = URL.createObjectURL(previewFile)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [previewFile])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.playbackRate = mode === 'speed' ? 1.25 : mode === 'slow' ? 0.75 : 1
  }, [mode, previewUrl])

  const loadSourceUrl = async () => {
    const value = sourceUrl.trim()
    if (!value) return
    try {
      new URL(value)
    } catch {
      setSourceError('Enter a complete URL, including https://')
      return
    }

    setLoadingSource(true)
    setSourceError('')
    try {
      const parsed = new URL(value)
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Invalid protocol')
      const response = await fetch(`/api/media-proxy?url=${encodeURIComponent(parsed.href)}&type=audio&quality=320`)
      if (!response.ok) {
        const details = await response.json().catch(() => null)
        throw new Error(details?.error || 'The link could not be loaded.')
      }
      const blob = await response.blob()
      const type = blob.type || 'audio/mpeg'
      setPreviewFile(new File([blob], 'linked-media', { type }))
      setActive(false)
    } catch (error) {
      setSourceError(error instanceof Error ? error.message : 'This link could not be loaded.')
    } finally {
      setLoadingSource(false)
    }
  }

  const preview = async () => {
    const audio = audioRef.current
    if (!audio) return
    if (active) {
      audio.pause()
      setActive(false)
      return
    }
    audio.currentTime = 0
    await audio.play()
    setActive(true)
  }

  const checkout = async () => {
    setCheckingOut(true)
    setCheckoutError('')

    // Reserve a tab before awaiting the server action so browsers do not block
    // the Stripe-hosted page, and never replace the v0 preview iframe.
    const checkoutWindow = window.self !== window.top ? window.open('about:blank', '_blank') : null

    try {
      const checkoutUrl = await startPremiumCheckout()
      if (window.self !== window.top) {
        if (!checkoutWindow) {
          setCheckoutError('Your browser blocked the checkout tab. Allow pop-ups and try again.')
        } else {
          checkoutWindow.location.href = checkoutUrl
        }
      } else {
        window.location.assign(checkoutUrl)
      }
    } catch {
      checkoutWindow?.close()
      setCheckoutError('Checkout is unavailable right now. Please try again.')
    } finally {
      setCheckingOut(false)
    }
  }

  return (
    <section id="remix" className="border-y border-border bg-secondary text-secondary-foreground">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-20 md:grid-cols-[1fr_1.15fr] md:items-center">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
            <Sparkles className="size-4" aria-hidden="true" /> Tone+
          </div>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-balance md:text-4xl">
            Make it yours.
          </h2>
          <p className="max-w-md leading-relaxed text-secondary-foreground/65">
            Remix your own recordings with speed controls, a warm lo-fi texture, and creative audio presets. Everything still happens in your browser.
          </p>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-heading text-4xl font-bold">$2.99</span>
            <span className="text-secondary-foreground/60">/ month</span>
          </div>
          <Button onClick={checkout} disabled={checkingOut} className="w-fit px-6">
            <Sparkles className="size-4" aria-hidden="true" />
            {checkingOut ? 'Opening checkout…' : 'Unlock Tone+'}
          </Button>
          <p className="text-xs text-secondary-foreground/45">Cancel anytime. Secure checkout by Stripe.</p>
          {checkoutError && <p role="alert" className="text-sm text-primary">{checkoutError}</p>}
        </div>

        <div className="rounded-2xl border border-secondary-foreground/10 bg-secondary-foreground/5 p-4 shadow-2xl shadow-black/20 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2 font-heading font-semibold"><Music2 className="size-4 text-primary" /> Remix board</span>
            <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-secondary-foreground/45"><Lock className="size-3" /> Premium preview</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {modes.map((item) => (
              <button key={item.id} type="button" onClick={() => setMode(item.id)} className={`rounded-xl border p-3 text-left transition-colors ${mode === item.id ? 'border-primary bg-primary text-primary-foreground' : 'border-secondary-foreground/10 hover:border-secondary-foreground/30'}`}>
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className="mt-1 block text-xs opacity-60">{item.note}</span>
              </button>
            ))}
          </div>
          <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-secondary-foreground/20 px-4 py-3 text-sm transition-colors hover:border-primary/70">
            <span className="min-w-0 truncate text-secondary-foreground/65">{previewFile ? previewFile.name : 'Upload a file for a 10-second preview'}</span>
            <span className="shrink-0 rounded-md bg-secondary-foreground/10 px-3 py-1.5 text-xs font-medium">Browse</span>
            <input type="file" accept="audio/*,video/*" className="sr-only" onChange={(event) => {
              setPreviewFile(event.target.files?.[0] ?? null)
              setSourceError('')
              setActive(false)
            }} />
          </label>
          <div className="mt-3 flex gap-2">
            <input
              value={sourceUrl}
              onChange={(event) => setSourceUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.nativeEvent.isComposing && event.keyCode !== 229) loadSourceUrl()
              }}
              placeholder="Or paste a direct audio/video URL"
              aria-label="Direct audio or video URL"
              className="min-w-0 flex-1 rounded-xl border border-secondary-foreground/10 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-secondary-foreground/35 focus:border-primary"
            />
            <button type="button" onClick={loadSourceUrl} disabled={!sourceUrl.trim() || loadingSource} className="rounded-xl bg-secondary-foreground/10 px-4 text-xs font-semibold transition-colors hover:bg-secondary-foreground/20 disabled:opacity-40">
              {loadingSource ? 'Loading…' : 'Use link'}
            </button>
          </div>
          {sourceError && <p role="alert" className="mt-2 text-xs text-primary">{sourceError}</p>}
          {previewUrl ? (
            <audio
              ref={audioRef}
              src={previewUrl}
              className="sr-only"
              onTimeUpdate={(event) => {
                if (event.currentTarget.currentTime >= 10) {
                  event.currentTarget.pause()
                  event.currentTarget.currentTime = 10
                  setActive(false)
                }
              }}
              onEnded={() => setActive(false)}
            />
          ) : null}
          <div className="mt-4 flex h-28 items-end gap-1 rounded-xl bg-secondary-foreground/5 px-4 py-5" aria-label="Audio waveform preview">
            {Array.from({ length: 42 }, (_, i) => <span key={i} className={`flex-1 rounded-full ${active ? 'animate-pulse bg-primary' : 'bg-primary/70'}`} style={{ height: `${18 + ((i * 17) % 65)}%`, animationDelay: `${i * 20}ms` }} />)}
          </div>
          <button type="button" onClick={preview} disabled={!previewUrl} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-secondary-foreground/10 py-3 text-sm font-medium transition-colors hover:bg-secondary-foreground/10 disabled:cursor-not-allowed disabled:opacity-40">
            <Play className={`size-4 ${active ? 'fill-current' : ''}`} aria-hidden="true" /> {active ? 'Playing preview' : `Preview ${modes.find((item) => item.id === mode)?.label} · 10s`}
          </button>
          <p className="mt-3 text-center text-xs text-secondary-foreground/45">Try a 10-second preview free. Unlock Tone+ to export the full remix.</p>
        </div>
      </div>
    </section>
  )
}
