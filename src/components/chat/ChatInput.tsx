import { useState, useRef, useEffect } from 'react'
import { AuiIf, ComposerPrimitive } from '@assistant-ui/react'
import { ArrowUp, BookMarked, ChevronDown, Zap, Brain, Sparkles, Square } from 'lucide-react'
import type { ThinkingMode } from '../../api/chat'
import { useLocale } from '../../i18n/locale'
import LanguagePicker from './LanguagePicker'

const MODES: { value: ThinkingMode; icon: typeof Zap }[] = [
  { value: 'normal', icon: Zap },
  { value: 'thinking', icon: Brain },
  { value: 'advanced', icon: Sparkles },
]

interface ChatInputProps {
  mode: ThinkingMode
  onModeChange: (mode: ThinkingMode) => void
  includeCitations: boolean
  onIncludeCitationsChange: (include: boolean) => void
  language: string
  onLanguageChange: (code: string) => void
}

const ROUND_BUTTON =
  'w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 bg-primary hover:bg-primary-dark text-white shadow-sm'

export default function ChatInput({
  mode,
  onModeChange,
  includeCitations,
  onIncludeCitationsChange,
  language,
  onLanguageChange,
}: ChatInputProps) {
  const { strings: t, languages } = useLocale()
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false)
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

  const currentMode = MODES.find(m => m.value === mode) || MODES[0]
  const CurrentIcon = currentMode.icon

  return (
    <div className="bg-chat-bg px-3 sm:px-4 pb-3 sm:pb-4 pt-2 shrink-0">
      <div className="max-w-3xl mx-auto">
        <ComposerPrimitive.Root>
          <div className="relative bg-white rounded-2xl border border-border shadow-sm focus-within:border-primary/40 focus-within:shadow-md transition-all">
            <ComposerPrimitive.Input
              placeholder={t.inputPlaceholder}
              rows={1}
              submitMode="enter"
              aria-label={t.inputLabel}
              className="block w-full resize-none bg-transparent px-4 pt-3.5 pb-12 text-sm pointer-coarse:text-base text-text-primary placeholder-text-muted outline-none max-h-[188px]"
            />

            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                <button
                  type="button"
                  onClick={() => onIncludeCitationsChange(!includeCitations)}
                  aria-pressed={includeCitations}
                  title={t.citations}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 pointer-coarse:py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    includeCitations
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-black/[0.04] text-text-muted'
                  }`}
                >
                  <BookMarked className="w-3.5 h-3.5" strokeWidth={1.8} />
                  <span className="max-sm:sr-only">{t.citations}</span>
                </button>

                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setModeDropdownOpen(prev => !prev)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 pointer-coarse:py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
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

              <AuiIf condition={s => !s.thread.isRunning}>
                <ComposerPrimitive.Send
                  aria-label={t.send}
                  className={`${ROUND_BUTTON} disabled:bg-black/[0.05] disabled:text-text-muted disabled:shadow-none disabled:cursor-not-allowed`}
                >
                  <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
                </ComposerPrimitive.Send>
              </AuiIf>
              <AuiIf condition={s => s.thread.isRunning}>
                <ComposerPrimitive.Cancel aria-label={t.stop} title={t.stop} className={ROUND_BUTTON}>
                  <Square className="w-3 h-3 fill-current" strokeWidth={2.5} />
                </ComposerPrimitive.Cancel>
              </AuiIf>
            </div>
          </div>
        </ComposerPrimitive.Root>
      </div>
    </div>
  )
}
