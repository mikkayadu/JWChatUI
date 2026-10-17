import { createPortal } from 'react-dom'
import { X, ExternalLink, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { bookSlug, studyBibleUrl, verseAnchor, type ScriptureRef } from '../../utils/scripture'
import { fetchScripture, type ScriptureResult } from '../../api/chat'
import { useLocale } from '../../i18n/locale'

interface ScripturePopupProps {
  scripture: ScriptureRef
  /** Language of the Bible to quote and link: the answer's language. */
  lang: string
  onClose: () => void
  anchorRect: DOMRect | null
}

type VerseState =
  | { status: 'loading' }
  | { status: 'loaded'; result: ScriptureResult }
  | { status: 'error' }

export default function ScripturePopup({ scripture, lang, onClose, anchorRect }: ScripturePopupProps) {
  const { strings: t } = useLocale()
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

  // The popup is mounted per reference, so the state starts out loading.
  const [verseState, setVerseState] = useState<VerseState>({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    fetchScripture(
      {
        book: scripture.book,
        chapter: scripture.chapter,
        verse: scripture.verse,
        endVerse: scripture.endVerse,
        lang,
        slug: bookSlug(scripture.book),
      },
      controller.signal
    )
      .then(result => setVerseState({ status: 'loaded', result }))
      .catch((e: unknown) => {
        if ((e as Error).name !== 'AbortError') setVerseState({ status: 'error' })
      })
    return () => controller.abort()
  }, [scripture, lang])

  // The backend returns the chapter page in `lang`. Until then, or if the
  // lookup fails, link the English study Bible, the only URL built locally.
  const jwOrgUrl =
    verseState.status === 'loaded'
      ? `${verseState.result.url}#${verseAnchor(scripture)}`
      : studyBibleUrl(scripture)

  // Phones (and short landscape screens) get a bottom sheet: an anchored
  // popover can't fit beside the reference there.
  const isSheet = window.innerWidth < 640 || window.innerHeight < 500
  const style: React.CSSProperties | undefined = isSheet
    ? undefined
    : anchorRect
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
        aria-label={t.scripture(scripture.label)}
        lang={lang}
        tabIndex={-1}
        style={style}
        className={`z-50 bg-white shadow-2xl border border-gray-200 overflow-hidden animate-fade-in-up ${
          isSheet
            ? 'fixed inset-x-0 bottom-0 rounded-t-2xl pb-[env(safe-area-inset-bottom)]'
            : 'w-80 rounded-xl'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 bg-primary/5 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-primary">{scripture.label}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeScripture}
            className="p-1 pointer-coarse:p-2 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="px-4 py-3">
          {verseState.status === 'loading' ? (
            <div className="flex items-center gap-2 text-sm text-text-secondary py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t.loadingVerse}
            </div>
          ) : verseState.status === 'error' ? (
            <p className="text-sm text-text-secondary leading-relaxed">
              {t.verseError}
            </p>
          ) : (
            <div className="space-y-2 max-h-[min(16rem,45dvh)] overflow-y-auto">
              {verseState.result.verses.map(v => (
                <p key={v.verse} className="text-sm text-text-primary leading-relaxed">
                  <sup className="text-[10px] font-bold text-primary mr-1">{v.verse}</sup>
                  {v.text}
                </p>
              ))}
            </div>
          )}

          <a
            href={jwOrgUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 pointer-coarse:py-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-primary no-underline hover:underline"
          >
            {t.openOnJwOrg}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>,
    document.body
  )
}
