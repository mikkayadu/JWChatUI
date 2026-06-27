import { createPortal } from 'react-dom'
import { X, ExternalLink, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { parseScriptureReference } from '../../utils/scripture'
import { fetchScripture, type ScriptureVerse } from '../../api/chat'

interface ScripturePopupProps {
  reference: string
  onClose: () => void
  anchorRect: DOMRect | null
}

export default function ScripturePopup({ reference, onClose, anchorRect }: ScripturePopupProps) {
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  useEffect(() => {
    popupRef.current?.focus()
  }, [])

  const parsed = parseScriptureReference(reference)

  const [verses, setVerses] = useState<ScriptureVerse[] | null>(null)
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  useEffect(() => {
    if (!parsed) return
    const controller = new AbortController()
    setStatus('loading')
    setVerses(null)
    fetchScripture(
      {
        slug: parsed.book.slug,
        book: parsed.book.number,
        chapter: parsed.chapter,
        verse: parsed.verse,
        endVerse: parsed.endVerse,
      },
      controller.signal
    )
      .then(result => {
        setVerses(result.verses)
        setStatus('loaded')
      })
      .catch((e: unknown) => {
        if ((e as Error).name !== 'AbortError') setStatus('error')
      })
    return () => controller.abort()
    // parsed is derived from `reference`; re-run only when the reference changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference])

  const style: React.CSSProperties = anchorRect
    ? {
        position: 'fixed',
        top: Math.min(anchorRect.bottom + 8, window.innerHeight - 200),
        left: Math.max(16, Math.min(anchorRect.left - 100, window.innerWidth - 336)),
      }
    : {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/20" aria-hidden="true" />
      <div
        ref={popupRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Scripture: ${reference}`}
        tabIndex={-1}
        style={style}
        className="z-50 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-in-up"
      >
        <div className="flex items-center justify-between px-4 py-3 bg-primary/5 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-primary">{reference}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close scripture popup"
            className="p-1 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="px-4 py-3">
          {!parsed ? (
            <p className="text-sm text-text-secondary italic leading-relaxed">
              Couldn't build a Bible link for{' '}
              <span className="font-medium text-primary">{reference}</span>.
            </p>
          ) : status === 'loading' ? (
            <div className="flex items-center gap-2 text-sm text-text-secondary py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading verse…
            </div>
          ) : status === 'error' ? (
            <p className="text-sm text-text-secondary leading-relaxed">
              Couldn't load the verse text right now.
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {verses?.map(v => (
                <p key={v.verse} className="text-sm text-text-primary leading-relaxed">
                  <sup className="text-[10px] font-bold text-primary mr-1">{v.verse}</sup>
                  {v.text}
                </p>
              ))}
            </div>
          )}

          {parsed && (
            <a
              href={parsed.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-primary no-underline hover:underline"
            >
              Open on JW.org
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
