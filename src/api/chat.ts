import type { ChatMeta, ChatResponse, LanguageInfo, SourceItem } from '../types'

/**
 * Base URL for the backend API. Empty in development so requests use relative
 * paths handled by Vite's dev proxy (see vite.config.ts). In production set
 * VITE_API_BASE_URL to the deployed backend origin (e.g. on Vercel).
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export type ThinkingMode = 'normal' | 'thinking' | 'advanced'

/** The `language` value that asks the backend to detect the question's language. */
export const AUTO_LANGUAGE = 'auto'

/** A non-2xx response from the backend. */
export class ApiError extends Error {
  readonly status: number
  /** Request fields a 422 validation error rejected, e.g. ["language"]. */
  readonly fields: string[]

  constructor(status: number, message: string, fields: string[] = []) {
    super(message)
    this.status = status
    this.fields = fields
  }
}

async function apiError(response: Response): Promise<ApiError> {
  const body = await response.json().catch(() => ({}))
  // FastAPI validation errors (422) carry a list, not a message; each entry's
  // `loc` ends with the rejected field (["body", "language"]).
  const detail = typeof body.detail === 'string' ? body.detail : `Request failed with status ${response.status}`
  const fields = Array.isArray(body.detail)
    ? body.detail.map((entry: { loc?: unknown[] }) => String(entry?.loc?.at(-1) ?? ''))
    : []
  return new ApiError(response.status, detail, fields)
}

export interface StreamCallbacks {
  onMeta?: (meta: ChatMeta) => void
  onSources?: (sources: SourceItem[]) => void
  onToken?: (text: string) => void
  onDone?: () => void
  onError?: (detail: string) => void
}

/**
 * Stream a chat answer over Server-Sent Events from POST /api/chat/stream.
 * Invokes callbacks as `meta`, `sources`, `token`, `done`, and `error` frames
 * arrive. `language` is "auto" or an enabled language code.
 */
export async function sendMessageStream(
  question: string,
  topK: number = 5,
  mode: ThinkingMode = 'normal',
  language: string = AUTO_LANGUAGE,
  callbacks: StreamCallbacks = {},
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch(`${API_BASE}/api/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, top_k: topK, mode, language }),
    signal,
  })

  if (!response.ok || !response.body) throw await apiError(response)

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  const dispatch = (frame: string) => {
    let event = 'message'
    const dataLines: string[] = []
    for (const line of frame.split('\n')) {
      if (line.startsWith('event:')) event = line.slice(6).trim()
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim())
    }
    if (dataLines.length === 0) return

    let data: unknown
    try {
      data = JSON.parse(dataLines.join('\n'))
    } catch {
      return
    }

    switch (event) {
      case 'meta':
        callbacks.onMeta?.(data as ChatMeta)
        break
      case 'sources':
        callbacks.onSources?.(data as SourceItem[])
        break
      case 'token':
        callbacks.onToken?.((data as { text: string }).text)
        break
      case 'done':
        callbacks.onDone?.()
        break
      case 'error':
        callbacks.onError?.((data as { detail: string }).detail)
        break
    }
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    // SSE frames are separated by a blank line.
    let sep: number
    while ((sep = buffer.indexOf('\n\n')) !== -1) {
      const frame = buffer.slice(0, sep)
      buffer = buffer.slice(sep + 2)
      if (frame.trim()) dispatch(frame)
    }
  }
}

export async function sendMessage(
  question: string,
  topK: number = 5,
  mode: ThinkingMode = 'normal',
  language: string = AUTO_LANGUAGE,
  signal?: AbortSignal
): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, top_k: topK, mode, language }),
    signal,
  })

  if (!response.ok) throw await apiError(response)

  return response.json()
}

export interface ScriptureVerse {
  verse: number
  text: string
}

export interface ScriptureResult {
  reference: string
  url: string
  verses: ScriptureVerse[]
}

/**
 * Fetch verse text from the backend, which scrapes jw.org (the browser can't
 * reach jw.org directly due to CORS). Coordinates come pre-parsed from
 * `resolveScripture`; `lang` picks the Bible's language. `slug` (the English
 * book slug) is ignored by current backends but still required by older ones.
 * The result's `url` is the chapter page in that language.
 */
export async function fetchScripture(
  params: {
    book: number
    chapter: number
    verse: number
    endVerse?: number | null
    lang: string
    slug: string
  },
  signal?: AbortSignal
): Promise<ScriptureResult> {
  const query = new URLSearchParams({
    book: String(params.book),
    chapter: String(params.chapter),
    verse: String(params.verse),
    lang: params.lang,
    slug: params.slug,
  })
  if (params.endVerse) query.set('end_verse', String(params.endVerse))

  const response = await fetch(`${API_BASE}/api/scripture?${query.toString()}`, { signal })
  if (!response.ok) throw await apiError(response)
  return response.json()
}

/** Enabled answer languages with their Bible book names. */
export async function fetchLanguages(signal?: AbortSignal): Promise<LanguageInfo[]> {
  const response = await fetch(`${API_BASE}/api/languages`, { signal })
  if (!response.ok) throw await apiError(response)
  return response.json()
}

const ogImageCache = new Map<string, string | null>()

export async function fetchOgImage(url: string): Promise<string | null> {
  if (ogImageCache.has(url)) return ogImageCache.get(url) ?? null

  try {
    const response = await fetch(`${API_BASE}/api/og-image?url=${encodeURIComponent(url)}`)
    if (!response.ok) return null
    const data = await response.json()
    const image = data.image ?? null
    ogImageCache.set(url, image)
    return image
  } catch {
    ogImageCache.set(url, null)
    return null
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`)
    return response.ok
  } catch {
    return false
  }
}
