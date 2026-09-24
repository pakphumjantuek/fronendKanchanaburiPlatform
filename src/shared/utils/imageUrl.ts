const apiOrigin = (import.meta.env.VITE_API_URL ?? 'https://localhost:7289/api').replace(
  /\/api$/,
  '',
)

export function imageUrl(url?: string | null) {
  if (!url) return ''

  return url.startsWith('/')
    ? `${apiOrigin}${url}`
    : url
}