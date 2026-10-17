import { memo, useState, useCallback, useMemo, type ReactNode } from 'react'
import { ExternalLink } from 'lucide-react'
import Markdown from 'react-markdown'
import type { SourceItem } from '../../types'
import type { UiStrings } from '../../i18n/strings'
import { bookNamesFor, useLocale } from '../../i18n/locale'
import { SCRIPTURE_PATTERN, resolveScripture, type ScriptureRef } from '../../utils/scripture'
import { classifySource } from '../../utils/jwUrl'
import ScripturePopup from './ScripturePopup'

interface AnswerContentProps {
  content: string
  sources: readonly SourceItem[]
  /** Language the answer is in; unset for older backends (English). */
  language?: string
  streaming?: boolean
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

/** Display type and title for a source, in the UI language. */
function describeSource(url: string, t: UiStrings): { type: string; title: string } {
  const { kind, title } = classifySource(url)
  const type = t.sourceTypes[kind]
  return { type, title: title || (kind === 'teaching' ? t.bibleTeaching : type) }
}

// A "Sources:" section starting a line. Older backends' Advanced mode ends
// answers with one, duplicating the list shown below the answer.
const SOURCES_SECTION = /(?:^|\n)[ \t]*(?:#{1,6}[ \t]*)?(?:\*\*|__)?Sources?(?:\*\*|__)?:/i

function parseResponseContent(text: string, backendSources: readonly SourceItem[], t: UiStrings): ParsedContent {
  const sectionStart = text.search(SOURCES_SECTION)
  const body = (sectionStart === -1 ? text : text.slice(0, sectionStart)).trim()

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
      const { type, title } = describeSource(url, t)
      const src: ParsedSource = { index, indices: [index], url, title, type }
      urlToSource.set(url, src)
      deduped.push(src)
    }
  }

  return { body, sources: deduped, sourceMap }
}

const CITATION_PATTERN = String.raw`\[(\d+)\]`
const INLINE_REGEX = new RegExp(`(${SCRIPTURE_PATTERN})|(${CITATION_PATTERN})`, 'gu')

type ScriptureClickHandler = (ref: ScriptureRef, e: React.MouseEvent<HTMLButtonElement>) => void

interface InlineContext {
  sourceMap: Map<number, string>
  /** Book names in the answer's language, for linking scripture references. */
  bookNames: readonly string[]
  t: UiStrings
  onScriptureClick: ScriptureClickHandler
}

function processInlineText(text: string, ctx: InlineContext): ReactNode[] {
  const { sourceMap, bookNames, t, onScriptureClick } = ctx
  const result: ReactNode[] = []
  let lastIndex = 0

  for (const match of text.matchAll(INLINE_REGEX)) {
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
            title={t.sourceNumber(num)}
            className="inline-flex items-center justify-center text-[10px] pointer-coarse:text-[11px] font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded px-1 py-px pointer-coarse:px-1.5 pointer-coarse:py-0.5 mx-px cursor-pointer no-underline transition-colors align-super leading-none"
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
      const resolved = resolveScripture(match[0], bookNames)
      if (!resolved) {
        result.push(match[0])
      } else {
        if (resolved.prefix) result.push(resolved.prefix)
        result.push(
          <button
            type="button"
            key={`s-${start}`}
            onClick={e => onScriptureClick(resolved.ref, e)}
            className="text-primary font-semibold hover:underline cursor-pointer bg-transparent border-none p-0 text-sm inline font-[inherit]"
          >
            {resolved.ref.label}
          </button>
        )
      }
    }

    lastIndex = start + match[0].length
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex))
  }

  return result
}

function processChildren(children: ReactNode, ctx: InlineContext): ReactNode {
  if (typeof children === 'string') {
    return processInlineText(children, ctx)
  }
  if (Array.isArray(children)) {
    return children.map((child, i) => {
      if (typeof child === 'string') {
        return <span key={i}>{processInlineText(child, ctx)}</span>
      }
      return child
    })
  }
  return children
}

/** An assistant answer: markdown with linked citations and scripture, then its sources. */
function AnswerContent({ content, sources: backendSources, language, streaming }: AnswerContentProps) {
  const { strings: t, languages } = useLocale()
  const [scripturePopup, setScripturePopup] = useState<{
    scripture: ScriptureRef
    rect: DOMRect
  } | null>(null)

  const handleScriptureClick = useCallback<ScriptureClickHandler>((scripture, e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setScripturePopup({ scripture, rect })
  }, [])

  const { body, sources, sourceMap } = useMemo(
    () => parseResponseContent(content, backendSources, t),
    [content, backendSources, t]
  )

  // Answers from backends without languages carry no language: English.
  const answerLanguage = language ?? 'en'
  const caret = streaming ? (
    <span
      aria-hidden="true"
      className="inline-block w-1.5 h-4 ml-0.5 align-text-bottom bg-primary/70 animate-pulse"
    />
  ) : null

  const inlineContext: InlineContext = {
    sourceMap,
    bookNames: bookNamesFor(languages, answerLanguage),
    t,
    onScriptureClick: handleScriptureClick,
  }
  const process = (children: ReactNode) => processChildren(children, inlineContext)

  return (
    <>
      <div className="prose-jwchat [overflow-wrap:anywhere]" lang={answerLanguage}>
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

      {sources.length > 0 && !streaming && (
        <div className="mt-4 pt-3 border-t border-border/60">
          <h5 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2.5">
            {t.sources}
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

      {scripturePopup && (
        <ScripturePopup
          key={scripturePopup.scripture.label}
          scripture={scripturePopup.scripture}
          lang={answerLanguage}
          anchorRect={scripturePopup.rect}
          onClose={() => setScripturePopup(null)}
        />
      )}
    </>
  )
}

// Memoised: while one answer streams, every token re-renders the chat, and the
// settled answers (same content and sources) can skip re-parsing.
export default memo(AnswerContent)
