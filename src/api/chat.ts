import type { ChatResponse, SourceItem } from '../types'

export type ThinkingMode = 'normal' | 'thinking' | 'advanced'

export interface StreamCallbacks {
  onSources?: (sources: SourceItem[]) => void
  onToken?: (text: string) => void
  onDone?: () => void
  onError?: (detail: string) => void
}

/**
 * Stream a chat answer over Server-Sent Events from POST /api/chat/stream.
 * Invokes callbacks as `sources`, `token`, `done`, and `error` frames arrive.
 */
export async function sendMessageStream(
  question: string,
  topK: number = 5,
  mode: ThinkingMode = 'normal',
  callbacks: StreamCallbacks = {},
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch('/api/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, top_k: topK, mode }),
    signal,
  })

  if (!response.ok || !response.body) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || `Request failed with status ${response.status}`)
  }

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

  // eslint-disable-next-line no-constant-condition
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
  signal?: AbortSignal
): Promise<ChatResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, top_k: topK, mode }),
    signal,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || `Request failed with status ${response.status}`)
  }

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
 * `parseScriptureReference`.
 */
export async function fetchScripture(
  params: { slug: string; book: number; chapter: number; verse: number; endVerse?: number | null },
  signal?: AbortSignal
): Promise<ScriptureResult> {
  const query = new URLSearchParams({
    slug: params.slug,
    book: String(params.book),
    chapter: String(params.chapter),
    verse: String(params.verse),
  })
  if (params.endVerse) query.set('end_verse', String(params.endVerse))

  const response = await fetch(`/api/scripture?${query.toString()}`, { signal })
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || `Request failed with status ${response.status}`)
  }
  return response.json()
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch('/health')
    return response.ok
  } catch {
    return false
  }
}
