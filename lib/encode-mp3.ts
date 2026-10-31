import { Mp3Encoder } from '@breezystack/lamejs'

const FRAME_SIZE = 1152
const FRAMES_PER_YIELD = 200

function floatTo16Bit(input: Float32Array) {
  const output = new Int16Array(input.length)
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]))
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  return output
}

export async function decodeFile(file: File) {
  const arrayBuffer = await file.arrayBuffer()
  const ctx = new AudioContext()
  try {
    return await ctx.decodeAudioData(arrayBuffer)
  } finally {
    ctx.close()
  }
}

export async function encodeMp3(
  audio: AudioBuffer,
  kbps: number,
  onProgress: (ratio: number) => void,
  signal?: AbortSignal,
) {
  const channels = Math.min(audio.numberOfChannels, 2)
  const encoder = new Mp3Encoder(channels, audio.sampleRate, kbps)
  const left = floatTo16Bit(audio.getChannelData(0))
  const right = channels === 2 ? floatTo16Bit(audio.getChannelData(1)) : undefined
  const chunks: Uint8Array[] = []
  const total = left.length

  for (let i = 0, frame = 0; i < total; i += FRAME_SIZE, frame++) {
    if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError')
    const l = left.subarray(i, i + FRAME_SIZE)
    const out = right ? encoder.encodeBuffer(l, right.subarray(i, i + FRAME_SIZE)) : encoder.encodeBuffer(l)
    if (out.length) chunks.push(new Uint8Array(out))

    if (frame % FRAMES_PER_YIELD === 0) {
      onProgress(i / total)
      await new Promise((r) => setTimeout(r, 0))
    }
  }

  const tail = encoder.flush()
  if (tail.length) chunks.push(new Uint8Array(tail))
  onProgress(1)
  return new Blob(chunks as BlobPart[], { type: 'audio/mpeg' })
}
