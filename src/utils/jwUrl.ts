// Classifies source URLs for display. jw.org path segments are listed in
// English and Twi (jw.org/tw).

export type SourceKind = 'book' | 'magazine' | 'video' | 'teaching' | 'article' | 'source'

// Checked in this order, so a book path that mentions videos stays a book.
const SECTION_SEGMENTS: [SourceKind, string[]][] = [
  ['book', ['books', 'nhoma']],
  ['magazine', ['magazines', 'nsɛmma-nhoma']],
  ['video', ['videos', 'video']],
]
const TEACHING_SEGMENTS = ['bible-teachings', 'questions', 'bible-nkyerɛkyerɛ', 'nsɛmmisa']
const LIBRARY_SEGMENTS = ['library', 'nhomakorabea']

export interface SourceInfo {
  kind: SourceKind
  /** Readable title from the URL path; empty when the path gives none, so the
   * caller can fall back to a label in the UI language. */
  title: string
  /** The site, e.g. "www.jw.org"; the raw source when it isn't a URL. */
  host: string
}

/** Parse a source as a URL, accepting ones stored without a scheme. */
function parseUrl(source: string): URL | null {
  try {
    return new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(source) ? source : `https://${source}`)
  } catch {
    return null
  }
}

/** Percent-decoded path segments; Twi slugs contain ɛ and ɔ. */
function pathSegments(url: URL): string[] {
  return url.pathname
    .split('/')
    .filter(Boolean)
    .map(segment => {
      try {
        return decodeURIComponent(segment)
      } catch {
        return segment
      }
    })
}

// Capitalise each word; \b\w would also capitalise after ɛ/ɔ ("NsɛM").
const formatSegment = (s: string) =>
  s.replace(/[-_]/g, ' ').replace(/(^|\s)(\p{L})/gu, (_, space, c) => space + c.toUpperCase())

export function classifySource(source: string): SourceInfo {
  const url = parseUrl(source)
  if (!url) {
    return {
      kind: 'source',
      title: source.length > 60 ? source.slice(0, 60) + '...' : source,
      host: source.split('/')[0],
    }
  }

  const segments = pathSegments(url)
  // Drop the language segment ("/en/", "/tw/").
  const parts = segments.length > 1 && segments[0].length === 2 ? segments.slice(1) : segments
  const host = url.hostname

  if (!host.includes('jw.org')) {
    return { kind: 'source', title: parts.slice(-2).map(formatSegment).join(' — ') || host, host }
  }

  for (const [kind, slugs] of SECTION_SEGMENTS) {
    const index = parts.findIndex(part => slugs.includes(part))
    if (index === -1) continue
    if (kind === 'video') {
      return { kind, title: parts.slice(index + 1).map(formatSegment).join(' — '), host }
    }
    // Books and magazines: "Publication — Chapter".
    const name = parts[index + 1] ? formatSegment(parts[index + 1]) : ''
    const extra = parts.slice(index + 2).map(formatSegment).join(' — ')
    return { kind, title: extra ? `${name} — ${extra}` : name, host }
  }

  if (parts.some(part => TEACHING_SEGMENTS.includes(part))) {
    const meaningful = parts.filter(part => !TEACHING_SEGMENTS.includes(part) && !LIBRARY_SEGMENTS.includes(part))
    return { kind: 'teaching', title: meaningful.map(formatSegment).join(' — '), host }
  }

  const meaningful = parts.filter(part => !LIBRARY_SEGMENTS.includes(part))
  return { kind: 'article', title: meaningful.slice(-2).map(formatSegment).join(' — ') || 'jw.org', host }
}
