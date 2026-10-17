import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Languages } from 'lucide-react'
import { useLocale } from '../../i18n/locale'
import { AUTO_LANGUAGE } from '../../api/chat'

interface LanguagePickerProps {
  /** "auto" or an enabled language code. */
  value: string
  onChange: (code: string) => void
}

export default function LanguagePicker({ value, onChange }: LanguagePickerProps) {
  const { strings: t, languages } = useLocale()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const options = [
    { code: AUTO_LANGUAGE, label: t.autoLanguage, description: t.autoLanguageDescription },
    ...languages.map(lang => ({ code: lang.code, label: lang.native_name, description: null })),
  ]
  const current = options.find(o => o.code === value) ?? options[0]
  const isAuto = current.code === AUTO_LANGUAGE

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        aria-label={`${t.answerLanguage}: ${current.label}`}
        aria-expanded={open}
        title={t.answerLanguage}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 pointer-coarse:py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
          !isAuto
            ? 'bg-primary/10 text-primary'
            : 'hover:bg-black/[0.04] text-text-muted'
        }`}
      >
        <Languages className="w-3.5 h-3.5" strokeWidth={1.8} />
        <span className="hidden sm:inline">{current.label}</span>
        <span className="sm:hidden">{isAuto ? current.label : current.code.toUpperCase()}</span>
        <ChevronDown className="w-3 h-3 hidden sm:block" />
      </button>

      {open && (
        <div className="absolute bottom-full right-0 mb-1.5 w-52 bg-white rounded-xl border border-border shadow-xl py-1.5 z-20 animate-fade-in-up">
          <div className="px-3.5 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
            {t.answerLanguage}
          </div>
          {options.map(option => {
            const isActive = option.code === current.code
            return (
              <button
                type="button"
                key={option.code}
                lang={option.code === AUTO_LANGUAGE ? undefined : option.code}
                onClick={() => {
                  onChange(option.code)
                  setOpen(false)
                }}
                className={`w-full px-3.5 py-2.5 text-left text-xs transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-primary/[0.08] text-primary'
                    : 'text-text-primary hover:bg-black/[0.03]'
                }`}
              >
                <div className="font-semibold text-[13px]">{option.label}</div>
                {option.description && (
                  <div className="text-text-muted text-[11px] mt-0.5">{option.description}</div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
