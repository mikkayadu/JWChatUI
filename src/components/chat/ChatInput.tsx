import { useState, useRef, useCallback, useEffect } from 'react'
import { ArrowUp, BookMarked, ChevronDown, Zap, Brain, Sparkles } from 'lucide-react'
import type { ThinkingMode } from '../../api/chat'
import { useLocale } from '../../i18n/locale'
import LanguagePicker from './LanguagePicker'

const MODES: { value: ThinkingMode; icon: typeof Zap }[] = [
  { value: 'normal', icon: Zap },
  { value: 'thinking', icon: Brain },
  { value: 'advanced', icon: Sparkles },
]

interface ChatInputProps {
  onSend: (message: string, includeCitations: boolean) => void
  isLoading: boolean
  mode: ThinkingMode
  onModeChange: (mode: ThinkingMode) => void
  language: string
  onLanguageChange: (code: string) => void
}

export default function ChatInput({
  onSend,
  isLoading,
  mode,
  onModeChange,
  language,
  onLanguageChange,
}: ChatInputProps) {
  const { strings: t, languages } = useLocale()
  const [message, setMessage] = useState('')
  const [includeCitations, setIncludeCitations] = useState(true)
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!modeDropdownOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setModeDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [modeDropdownOpen])

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault()
      const trimmed = message.trim()
      if (!trimmed || isLoading) return
      onSend(trimmed, includeCitations)
      setMessage('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    },
    [message, isLoading, onSend, includeCitations]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 140) + 'px'
  }, [])

  const currentMode = MODES.find(m => m.value === mode) || MODES[0]
  const CurrentIcon = currentMode.icon
  const hasContent = message.trim().length > 0

  return (
    <div className="bg-chat-bg px-4 pb-4 pt-2 shrink-0">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="relative bg-white rounded-2xl border border-border shadow-sm focus-within:border-primary/40 focus-within:shadow-md transition-all">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={t.inputPlaceholder}
              disabled={isLoading}
              rows={1}
              aria-label={t.inputLabel}
              className="w-full resize-none bg-transparent px-4 pt-3.5 pb-12 text-sm text-text-primary placeholder-text-muted outline-none disabled:opacity-50"
            />

            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIncludeCitations(prev => !prev)}
                  aria-pressed={includeCitations}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    includeCitations
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-black/[0.04] text-text-muted'
                  }`}
                >
                  <BookMarked className="w-3.5 h-3.5" strokeWidth={1.8} />
                  {t.citations}
                </button>

                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setModeDropdownOpen(prev => !prev)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      mode !== 'normal'
                        ? 'bg-accent-gold/10 text-accent-gold'
                        : 'hover:bg-black/[0.04] text-text-muted'
                    }`}
                  >
                    <CurrentIcon className="w-3.5 h-3.5" strokeWidth={1.8} />
                    {t.modes[currentMode.value].label}
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {modeDropdownOpen && (
                    <div className="absolute bottom-full left-0 mb-1.5 w-52 bg-white rounded-xl border border-border shadow-xl py-1.5 z-20 animate-fade-in-up">
                      {MODES.map(m => {
                        const Icon = m.icon
                        const isActive = m.value === mode
                        return (
                          <button
                            type="button"
                            key={m.value}
                            onClick={() => {
                              onModeChange(m.value)
                              setModeDropdownOpen(false)
                            }}
                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left text-xs transition-colors cursor-pointer ${
                              isActive
                                ? 'bg-primary/[0.08] text-primary'
                                : 'text-text-primary hover:bg-black/[0.03]'
                            }`}
                          >
                            <Icon className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                            <div>
                              <div className="font-semibold text-[13px]">{t.modes[m.value].label}</div>
                              <div className="text-text-muted text-[11px] mt-0.5">{t.modes[m.value].description}</div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {languages.length > 1 && (
                  <LanguagePicker value={language} onChange={onLanguageChange} />
                )}
              </div>

              <button
                type="submit"
                disabled={!hasContent || isLoading}
                aria-label={t.send}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  hasContent && !isLoading
                    ? 'bg-primary hover:bg-primary-dark text-white shadow-sm'
                    : 'bg-black/[0.05] text-text-muted cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                ) : (
                  <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
