import { useState, useCallback, type ReactNode } from 'react'
import { BookOpenCheck, ExternalLink } from 'lucide-react'
import Markdown from 'react-markdown'
import type { ChatMessage, SourceItem } from '../../types'
import ScripturePopup from './ScripturePopup'

interface MessageBubbleProps {
  message: ChatMessage
}

interface ParsedSource {
  index: number
  indices: number[]
  url: string
  title: string
  type: string
}

interface ParsedContent {
  body: string
  sources: ParsedSource[]
  sourceMap: Map<number, string>
}

function classifyUrl(url: string): { type: string; title: string } {
  try {
    const parsed = new URL(url)
    const path = parsed.pathname
    const segments = path.split('/').filter(Boolean)

    const parts =
      segments.length > 1 && segments[0].length === 2
        ? segments.slice(1)
        : segments

    const formatSegment = (s: string) =>
      s.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

    if (parsed.hostname.includes('jw.org') || parsed.hostname.includes('wol.jw.org')) {
      if (parts.includes('books')) {
        const bookIdx = parts.indexOf('books')
        const bookName = parts[bookIdx + 1] ? formatSegment(parts[bookIdx + 1]) : ''
        const extra = parts.slice(bookIdx + 2).map(formatSegment).join(' — ')
        return { type: 'Book', title: extra ? `${bookName} — ${extra}` : bookName || 'Book' }
      }
      if (parts.includes('magazines')) {
        const magIdx = parts.indexOf('magazines')
        const magName = parts[magIdx + 1] ? formatSegment(parts[magIdx + 1]) : ''
        const article = parts.slice(magIdx + 2).map(formatSegment).join(' — ')
        return { type: 'Magazine', title: article ? `${magName} — ${article}` : magName || 'Magazine' }
      }
      if (parts.includes('videos')) {
        const vidIdx = parts.indexOf('videos')
        const vidName = parts.slice(vidIdx + 1).map(formatSegment).join(' — ')
        return { type: 'Video', title: vidName || 'Video' }
      }
      if (parts.includes('bible-teachings') || parts.includes('questions')) {
        const meaningful = parts.filter(p => !['bible-teachings', 'questions', 'library'].includes(p))
        return { type: 'Article', title: meaningful.map(formatSegment).join(' — ') || 'Bible Teaching' }
      }
      const meaningful = parts.filter(p => !['library'].includes(p))
      return { type: 'Article', title: meaningful.slice(-2).map(formatSegment).join(' — ') || 'jw.org' }
    }

    return { type: 'Source', title: parts.slice(-2).map(formatSegment).join(' — ') || parsed.hostname }
  } catch {
    return { type: 'Source', title: url.length > 60 ? url.slice(0, 60) + '...' : url }
  }
}

function parseResponseContent(text: string, backendSources: SourceItem[]): ParsedContent {
  const sourceSplitRegex = /\n*Sources?:\s*/i
  const parts = text.split(sourceSplitRegex)
  const body = parts[0].trim()

  const sourceMap = new Map<number, string>()
  const deduped: ParsedSource[] = []
  const urlToSource = new Map<string, ParsedSource>()

  for (let i = 0; i < backendSources.length; i++) {
    const index = i + 1
    const url = backendSources[i].source
    sourceMap.set(index, url)

    const existing = urlToSource.get(url)
    if (existing) {
      existing.indices.push(index)
    } else {
      const { type, title } = classifyUrl(url)
      const src: ParsedSource = { index, indices: [index], url, title, type }
      urlToSource.set(url, src)
      deduped.push(src)
    }
  }

  return { body, sources: deduped, sourceMap }
}

const SCRIPTURE_REGEX = /\b(\d?\s?[A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\s+(\d+:\d+(?:[,\s]+\d+)*(?:[-–]\d+(?::\d+)?)?)/g
const CITATION_REGEX = /\[(\d+)\]/g

function processInlineText(
  text: string,
  sourceMap: Map<number, string>,
  onScriptureClick: (ref: string, e: React.MouseEvent<HTMLButtonElement>) => void
): ReactNode[] {
  const combined = new RegExp(`(${SCRIPTURE_REGEX.source})|(${CITATION_REGEX.source})`, 'g')
  const result: ReactNode[] = []
  let lastIndex = 0

  for (const match of text.matchAll(combined)) {
    const start = match.index
    if (start > lastIndex) {
      result.push(text.slice(lastIndex, start))
    }

    if (match[0].startsWith('[')) {
      const num = parseInt(match[0].slice(1, -1), 10)
      const url = sourceMap.get(num)
      if (url) {
        result.push(
          <a
            key={`c-${start}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title={`Source ${num}`}
            className="inline-flex items-center justify-center text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded px-1 py-px mx-px cursor-pointer no-underline transition-colors align-super leading-none"
          >
            {num}
          </a>
        )
      } else {
        result.push(
          <span key={`c-${start}`} className="text-[10px] font-bold text-text-muted bg-gray-100 rounded px-1 py-px mx-px align-super leading-none">
            {num}
          </span>
        )
      }
    } else {
      result.push(
        <button
          type="button"
          key={`s-${start}`}
          onClick={e => onScriptureClick(match[0], e)}
          className="text-primary font-semibold hover:underline cursor-pointer bg-transparent border-none p-0 text-sm inline font-[inherit]"
        >
          {match[0]}
        </button>
      )
    }

    lastIndex = start + match[0].length
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex))
  }

  return result
}

function processChildren(
  children: ReactNode,
  sourceMap: Map<number, string>,
  onScriptureClick: (ref: string, e: React.MouseEvent<HTMLButtonElement>) => void
): ReactNode {
  if (typeof children === 'string') {
    return processInlineText(children, sourceMap, onScriptureClick)
  }
  if (Array.isArray(children)) {
    return children.map((child, i) => {
      if (typeof child === 'string') {
        return <span key={i}>{processInlineText(child, sourceMap, onScriptureClick)}</span>
      }
      return child
    })
  }
  return children
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const [scripturePopup, setScripturePopup] = useState<{
    reference: string
    rect: DOMRect
  } | null>(null)

  const handleScriptureClick = useCallback(
    (reference: string, e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      setScripturePopup({ reference, rect })
    },
    []
  )

  if (message.role === 'user') {
    return (
      <div className="flex justify-end gap-3 px-6">
        <div className="max-w-[75%] bg-user-bg rounded-2xl rounded-br-sm px-4 py-3 shadow-sm">
          <p className="text-sm text-white leading-relaxed">{message.content}</p>
        </div>
      </div>
    )
  }

  const { body, sources, sourceMap } = parseResponseContent(message.content, message.sources)
  const caret = message.streaming ? (
    <span
      aria-hidden="true"
      className="inline-block w-1.5 h-4 ml-0.5 align-text-bottom bg-primary/70 animate-pulse"
    />
  ) : null

  const process = (children: ReactNode) =>
    processChildren(children, sourceMap, handleScriptureClick)

  return (
    <div className="flex gap-3 px-6">
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
        <BookOpenCheck className="w-4 h-4 text-white" strokeWidth={2} />
      </div>
      <div className="max-w-[80%] bg-white rounded-2xl rounded-bl-sm border border-border/60 px-5 py-4 shadow-sm">
        <div className="prose-jwchat">
          <Markdown
            components={{
              p: ({ children: c }) => (
                <p className="text-sm text-text-primary leading-relaxed mb-3 last:mb-0">
                  {process(c)}
                </p>
              ),
              strong: ({ children: c }) => (
                <strong className="font-semibold text-text-primary">{process(c)}</strong>
              ),
              em: ({ children: c }) => (
                <em className="italic">{process(c)}</em>
              ),
              h1: ({ children: c }) => (
                <div className="border-l-3 border-accent-blue pl-3 mt-4 mb-2 first:mt-0">
                  <h4 className="text-xs font-bold tracking-wider uppercase text-accent-blue">{process(c)}</h4>
                </div>
              ),
              h2: ({ children: c }) => (
                <div className="border-l-3 border-accent-blue pl-3 mt-4 mb-2 first:mt-0">
                  <h4 className="text-xs font-bold tracking-wider uppercase text-accent-blue">{process(c)}</h4>
                </div>
              ),
              h3: ({ children: c }) => (
                <div className="border-l-3 border-accent-orange pl-3 mt-3 mb-2">
                  <h4 className="text-xs font-bold tracking-wider uppercase text-accent-orange">{process(c)}</h4>
                </div>
              ),
              ul: ({ children: c }) => (
                <ul className="list-disc pl-5 mb-3 space-y-1.5">{c}</ul>
              ),
              ol: ({ children: c }) => (
                <ol className="list-decimal pl-5 mb-3 space-y-1.5">{c}</ol>
              ),
              li: ({ children: c }) => (
                <li className="text-sm text-text-primary leading-relaxed">{process(c)}</li>
              ),
              blockquote: ({ children: c }) => (
                <blockquote className="border-l-3 border-primary/30 pl-3 my-3 italic text-text-secondary text-sm">
                  {c}
                </blockquote>
              ),
              a: ({ href, children: c }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {c}
                </a>
              ),
            }}
          >
            {body}
          </Markdown>
          {caret}
        </div>

        {sources.length > 0 && !message.streaming && (
          <div className="mt-4 pt-3 border-t border-border/60">
            <h5 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2.5">
              Sources
            </h5>
            <ol className="space-y-2 list-none m-0 p-0">
              {sources.map(src => (
                <li key={src.index} className="group">
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2.5 rounded-lg px-2.5 py-2 -mx-2.5 hover:bg-gray-50 transition-colors no-underline"
                  >
                    <span className="text-[11px] font-bold text-primary bg-primary/10 rounded px-1.5 py-0.5 shrink-0 mt-0.5">
                      {src.index}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-accent-orange">
                          {src.type}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-text-primary leading-snug m-0 flex items-center gap-1">
                        <span className="line-clamp-1">{src.title}</span>
                        <ExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                      </p>
                    </div>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {scripturePopup && (
        <ScripturePopup
          reference={scripturePopup.reference}
          anchorRect={scripturePopup.rect}
          onClose={() => setScripturePopup(null)}
        />
      )}
    </div>
  )
}
