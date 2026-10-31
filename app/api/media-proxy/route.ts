export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BYTES = 250 * 1024 * 1024

function getYouTubeId(value: string) {
  try {
    const url = new URL(value)
    if (!['www.youtube.com', 'youtube.com', 'm.youtube.com', 'youtu.be', 'music.youtube.com'].includes(url.hostname)) return null
    if (url.hostname === 'youtu.be') return url.pathname.slice(1).split('/')[0] || null
    return url.searchParams.get('v') || url.pathname.match(/\/shorts\/([^/]+)/)?.[1] || url.pathname.match(/\/embed\/([^/]+)/)?.[1] || null
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const raw = requestUrl.searchParams.get('url')
  const type = requestUrl.searchParams.get('type') === 'video' ? 'video' : 'audio'
  const quality = requestUrl.searchParams.get('quality') || '320'
  if (!raw) return Response.json({ error: 'Missing media URL.' }, { status: 400 })

  const youtubeId = getYouTubeId(raw)
  if (youtubeId) {
    try {
      const apiResponse = await fetch('https://api.samplecut.app/v1/downloads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: raw, type, quality }),
        cache: 'no-store',
      })
      const contentType = apiResponse.headers.get('content-type') || ''
      if (!apiResponse.ok) {
        return Response.json({ error: 'The managed extractor could not process this YouTube video.' }, { status: 502 })
      }
      if (contentType.includes('audio/') || contentType.includes('video/')) {
        return new Response(apiResponse.body, {
          headers: { 'Content-Type': contentType, 'Content-Disposition': 'inline', 'Cache-Control': 'no-store' },
        })
      }
      const result = (await apiResponse.json()) as { url?: string; download_url?: string; downloadUrl?: string }
      const downloadUrl = result.download_url || result.downloadUrl || result.url
      if (!downloadUrl) return Response.json({ error: 'The managed extractor returned no downloadable audio.' }, { status: 502 })
      const mediaResponse = await fetch(downloadUrl, { redirect: 'follow' })
      if (!mediaResponse.ok || !mediaResponse.body) return Response.json({ error: 'The extracted audio could not be downloaded.' }, { status: 502 })
      return new Response(mediaResponse.body, {
        headers: { 'Content-Type': mediaResponse.headers.get('content-type') || 'audio/mpeg', 'Content-Disposition': 'inline', 'Cache-Control': 'no-store' },
      })
    } catch (error) {
      console.error('[v0] Managed extractor request failed:', error)
      return Response.json({ error: 'The managed extractor could not be reached.' }, { status: 502 })
    }
  }

  try {
    const url = new URL(raw)
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Unsupported protocol')
    const upstream = await fetch(url, { redirect: 'follow' })
    if (!upstream.ok || !upstream.body) return Response.json({ error: 'The media host returned an error.' }, { status: 502 })
    const length = Number(upstream.headers.get('content-length') || 0)
    if (length > MAX_BYTES) return Response.json({ error: 'That file is larger than 250 MB.' }, { status: 413 })
    const contentType = upstream.headers.get('content-type') || 'application/octet-stream'
    if (contentType.includes('text/html')) return Response.json({ error: 'This URL is a webpage, not a media file.' }, { status: 415 })
    return new Response(upstream.body, {
      headers: { 'Content-Type': contentType, 'Cache-Control': 'no-store' },
    })
  } catch {
    return Response.json({ error: 'The media link could not be loaded.' }, { status: 400 })
  }
}
