'use client'

import { useRef, useState } from 'react'
import { Download, FileAudio, Loader2, RotateCcw, Upload, X } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { decodeFile, encodeMp3 } from '@/lib/encode-mp3'

const BITRATES = [128, 192, 320] as const
const VIDEO_QUALITIES = [360, 720, 1080] as const
type Bitrate = (typeof BITRATES)[number]
type OutputType = 'mp3' | 'video'

type Status =
  | { kind: 'idle' }
  | { kind: 'decoding' }
  | { kind: 'encoding'; progress: number }
  | { kind: 'done'; url: string; size: number; name: string }
  | { kind: 'error'; message: string }

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function Converter() {
  const [file, setFile] = useState<File | null>(null)
  const [bitrate, setBitrate] = useState<Bitrate>(320)
  const [outputType, setOutputType] = useState<OutputType>('mp3')
  const [videoQuality, setVideoQuality] = useState<(typeof VIDEO_QUALITIES)[number]>(720)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [dragging, setDragging] = useState(false)
  const [sourceUrl, setSourceUrl] = useState('')
  const [loadingUrl, setLoadingUrl] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const busy = status.kind === 'decoding' || status.kind === 'encoding'

  function selectFile(next: File | undefined) {
    if (!next) return
    if (status.kind === 'done') URL.revokeObjectURL(status.url)
    setFile(next)
    setStatus({ kind: 'idle' })
  }

  function reset() {
    abortRef.current?.abort()
    if (status.kind === 'done') URL.revokeObjectURL(status.url)
    setFile(null)
    setSourceUrl('')
    setStatus({ kind: 'idle' })
    if (inputRef.current) inputRef.current.value = ''
  }

  async function loadUrl() {
    const value = sourceUrl.trim()
    if (!value) return
    try {
      const parsed = new URL(value)
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Invalid protocol')
      setLoadingUrl(true)
      setStatus({ kind: 'decoding' })
      const response = await fetch(`/api/media-proxy?url=${encodeURIComponent(parsed.href)}&type=${outputType}&quality=${videoQuality}`)
      if (!response.ok) {
        const details = await response.json().catch(() => null)
        throw new Error(details?.error || 'The link could not be loaded.')
      }
      const blob = await response.blob()
      if (outputType === 'video' && !blob.type.startsWith('video/')) {
        throw new Error('The extraction service returned audio instead of a video. Choose MP3 audio or use a provider that supports video downloads.')
      }
      const pathname = parsed.pathname.split('/').pop() || 'remote-media'
      const extension = outputType === 'video' ? 'mp4' : 'media'
      selectFile(new File([blob], pathname.includes('.') ? pathname : `${pathname}.${extension}`, { type: blob.type }))
    } catch (error) {
      setStatus({
        kind: 'error',
        message: error instanceof Error ? error.message : 'This link could not be loaded.',
      })
    } finally {
      setLoadingUrl(false)
    }
  }

  async function convert() {
    if (!file) return
    if (outputType === 'video') {
      if (file.type.startsWith('audio/')) {
        setStatus({ kind: 'error', message: 'This source contains audio only. Choose an actual video file or a video-capable extraction provider.' })
        return
      }
      if (status.kind === 'done') URL.revokeObjectURL(status.url)
      setStatus({ kind: 'done', url: URL.createObjectURL(file), size: file.size, name: file.name.replace(/\.[^.]+$/, '') + ` (${videoQuality}p).${file.name.split('.').pop() || 'mp4'}` })
      return
    }
    const controller = new AbortController()
    abortRef.current = controller
    try {
      setStatus({ kind: 'decoding' })
      const audio = await decodeFile(file)
      setStatus({ kind: 'encoding', progress: 0 })
      const blob = await encodeMp3(
        audio,
        bitrate,
        (progress) => setStatus({ kind: 'encoding', progress }),
        controller.signal,
      )
      const name = `${file.name.replace(/\.[^.]+$/, '')} (${bitrate}kbps).mp3`
      setStatus({ kind: 'done', url: URL.createObjectURL(blob), size: blob.size, name })
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setStatus({ kind: 'idle' })
        return
      }
      setStatus({
        kind: 'error',
        message: "This file couldn't be decoded. Try a common format like MP4, WAV, M4A, FLAC, OGG or WEBM.",
      })
    }
  }

  const progress =
    status.kind === 'encoding' ? status.progress : status.kind === 'done' ? 1 : 0

  return (
    <div className="overflow-hidden rounded-2xl bg-secondary text-secondary-foreground shadow-2xl shadow-foreground/20">
      <div className="flex items-center justify-between border-b border-secondary-foreground/10 px-5 py-3">
        <div className="flex items-center gap-2">
          <span
            className={cn('size-2 rounded-full', busy ? 'animate-pulse bg-primary' : 'bg-secondary-foreground/30')}
            aria-hidden="true"
          />
          <span className="font-mono text-xs uppercase tracking-widest text-secondary-foreground/60">
            {busy ? 'Processing' : status.kind === 'done' ? 'Ready' : 'Standby'}
          </span>
        </div>
        <span className="font-mono text-xs uppercase tracking-widest text-secondary-foreground/60">
          {outputType === 'video' ? `VIDEO / ${videoQuality}p` : `MP3 / ${bitrate}kbps`}
        </span>
      </div>

      <div className="flex flex-col gap-5 p-5 md:p-6">
        {!file ? (
          <>
          <label
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              selectFile(e.dataTransfer.files[0])
            }}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors',
              dragging
                ? 'border-primary bg-primary/10'
                : 'border-secondary-foreground/20 hover:border-secondary-foreground/40',
            )}
          >
            <Upload className="size-6 text-primary" aria-hidden="true" />
            <span className="font-heading text-lg font-semibold">Drop an audio or video file</span>
            <span className="text-sm leading-relaxed text-secondary-foreground/60">
              or click to browse — MP4, MOV, WEBM, WAV, M4A, FLAC, OGG
            </span>
            <input
              ref={inputRef}
              type="file"
              accept="audio/*,video/*"
              className="sr-only"
              onChange={(e) => selectFile(e.target.files?.[0])}
            />
          </label>
          <div className="flex gap-2">
            <input
              value={sourceUrl}
              onChange={(event) => setSourceUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.nativeEvent.isComposing && event.keyCode !== 229) loadUrl()
              }}
              placeholder="Or paste a direct audio/video URL"
              aria-label="Direct audio or video URL"
              className="min-w-0 flex-1 rounded-xl border border-secondary-foreground/15 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-secondary-foreground/35 focus:border-primary"
            />
            <Button type="button" variant="outline" onClick={loadUrl} disabled={!sourceUrl.trim() || loadingUrl} className="border-secondary-foreground/20 bg-transparent text-secondary-foreground hover:bg-secondary-foreground/10 hover:text-secondary-foreground">
              {loadingUrl ? 'Loading…' : 'Use link'}
            </Button>
          </div>
          </>
        ) : (
          <div className="flex items-center gap-3 rounded-xl bg-secondary-foreground/5 p-4">
            <FileAudio className="size-5 shrink-0 text-primary" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-secondary-foreground/60">{formatBytes(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="rounded-md p-1.5 text-secondary-foreground/60 transition-colors hover:bg-secondary-foreground/10 hover:text-secondary-foreground"
              aria-label="Remove file"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        <fieldset className="flex flex-col gap-2" disabled={busy}>
          <legend className="mb-2 font-mono text-xs uppercase tracking-widest text-secondary-foreground/60">MP3 quality</legend>
          <div className="grid grid-cols-3 gap-2">
            {BITRATES.map((rate) => (
              <label key={rate} className={cn('flex cursor-pointer flex-col items-center gap-0.5 rounded-lg border px-3 py-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring', bitrate === rate ? 'border-primary bg-primary text-primary-foreground' : 'border-secondary-foreground/15 hover:border-secondary-foreground/40')}>
                <input type="radio" name="bitrate" value={rate} checked={bitrate === rate} onChange={() => setBitrate(rate)} className="sr-only" />
                <span className="font-heading text-xl font-bold tabular-nums">{rate}</span>
                <span className="text-xs opacity-75">{rate === 128 ? 'Smaller' : rate === 192 ? 'Balanced' : 'Best'}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div
          className="h-1.5 overflow-hidden rounded-full bg-secondary-foreground/10"
          role="progressbar"
          aria-label="Conversion progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-200"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <div aria-live="polite" className="min-h-5 text-sm text-secondary-foreground/70">
          {status.kind === 'decoding' && 'Reading audio…'}
          {status.kind === 'encoding' && `Encoding at ${bitrate}kbps — ${Math.round(status.progress * 100)}%`}
          {status.kind === 'done' && `Done · ${formatBytes(status.size)}`}
          {status.kind === 'error' && <span className="text-primary">{status.message}</span>}
          {status.kind === 'idle' && (file ? 'Ready to convert.' : 'Files never leave your device.')}
        </div>

        {status.kind === 'done' ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              href={status.url}
              download={status.name}
              className={cn(buttonVariants({ size: 'lg' }), 'h-12 flex-1 text-base')}
            >
              <Download className="size-4" aria-hidden="true" />
              Download {outputType === 'video' ? 'Video' : 'MP3'}
            </a>
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={reset}
              className="h-12 border-secondary-foreground/20 bg-transparent text-secondary-foreground hover:bg-secondary-foreground/10 hover:text-secondary-foreground"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Convert another
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            size="lg"
            onClick={busy ? () => abortRef.current?.abort() : convert}
            disabled={!file || status.kind === 'decoding'}
            className="h-12 text-base"
          >
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                {status.kind === 'encoding' ? 'Cancel' : 'Reading…'}
              </>
            ) : (
              outputType === 'video' ? 'Prepare video download' : 'Convert to MP3'
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
