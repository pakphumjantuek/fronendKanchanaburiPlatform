const YOUTUBE_THUMBNAIL_BASE_URL = 'https://i.ytimg.com/vi'

export function youtubeThumbnail(url?: string | null) {
  if (!url) return ''

  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.replace(/^www\./, '').toLowerCase()
    let videoId = ''

    if (hostname === 'youtu.be') {
      videoId = parsed.pathname.split('/').filter(Boolean)[0] ?? ''
    } else if (
      hostname === 'youtube.com' ||
      hostname.endsWith('.youtube.com') ||
      hostname === 'youtube-nocookie.com' ||
      hostname.endsWith('.youtube-nocookie.com')
    ) {
      videoId =
        parsed.searchParams.get('v') ??
        parsed.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1] ??
        ''
    } else {
      return ''
    }

    return videoId ? `${YOUTUBE_THUMBNAIL_BASE_URL}/${videoId}/hqdefault.jpg` : ''
  } catch {
    return ''
  }
}

export function toNullableNumber(value: number | string | null) {
  if (value === null || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

export function youtubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url)
    const videoId = parsed.hostname.includes('youtu.be')
      ? parsed.pathname.slice(1)
      : (parsed.searchParams.get('v') ??
        (parsed.pathname.startsWith('/embed/') ? parsed.pathname.split('/')[2] : ''))
    return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : ''
  } catch {
    return ''
  }
}
