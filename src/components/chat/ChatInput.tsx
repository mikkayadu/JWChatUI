import { useState, useRef, useCallback, useEffect } from 'react'
import { Send, BookMarked, ChevronDown, Zap, Brain, Sparkles } from 'lucide-react'
import type { ThinkingMode } from '../../api/chat'

const MODES: { value: ThinkingMode; label: string; description: string; icon: typeof Zap }[] = [
  { value: 'normal', label: 'Normal', description: 'Fast response', icon: Zap },
  { value: 'thinking', label: 'Thinking', description: 'Deeper analysis', icon: Brain },
  { value: 'advanced', label: 'Advanced', description: 'Multi-strategy', icon: Sparkles },
]

interface ChatInputProps {
  onSend: (message: string, includeCitations: boolean) => void
  isLoading: boolean
  mode: ThinkingMode
  onModeChange: (mode: ThinkingMode) => void
}

export default function ChatInput({ onSend, isLoading, mode, onModeChange }: ChatInputProps) {
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
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }, [])

  const currentMode = MODES.find(m => m.value === mode) || MODES[0]
  const CurrentIcon = currentMode.icon

  return (
    <div className="border-t border-border bg-white px-6 py-4 shrink-0">
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about Bible teachings..."
            disabled={isLoading}
            rows={1}
            aria-label="Message input"
            className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 disabled:opacity-50 transition-colors"
          />
          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              onClick={() => setIncludeCitations(prev => !prev)}
              aria-pressed={includeCitations}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                includeCitations
                  ? 'bg-primary/10 text-primary'
                  : 'bg-gray-100 text-text-muted'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5" />
              Include Citations
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setModeDropdownOpen(prev => !prev)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 hover:bg-gray-200 text-text-secondary transition-colors cursor-pointer"
              >
                <CurrentIcon className="w-3.5 h-3.5" />
                {currentMode.label}
                <ChevronDown className="w-3 h-3" />
              </button>

              {modeDropdownOpen && (
                <div className="absolute bottom-full left-0 mb-1 w-48 bg-white rounded-lg border border-border shadow-lg py-1 z-20">
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
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-text-primary hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <div>
                          <div className="font-medium">{m.label}</div>
                          <div className="text-text-muted text-[10px]">{m.description}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center pb-8">
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            aria-label="Send message"
            className="w-10 h-10 rounded-full bg-primary hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
