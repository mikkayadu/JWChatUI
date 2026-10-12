import { useEffect, useRef, useCallback, useMemo } from 'react'
import { Settings, BookOpenCheck } from 'lucide-react'
import type { ChatMessage } from '../../types'
import type { ThinkingMode } from '../../api/chat'
import MessageBubble from './MessageBubble'
import ChatInput from './ChatInput'
import { JWWatermark } from '../JWLogo'
import { useLocale } from '../../i18n/locale'

interface ChatAreaProps {
  messages: ChatMessage[]
  isLoading: boolean
  onSend: (message: string, includeCitations: boolean) => void
  mode: ThinkingMode
  onModeChange: (mode: ThinkingMode) => void
  language: string
  onLanguageChange: (code: string) => void
}

export default function ChatArea({
  messages,
  isLoading,
  onSend,
  mode,
  onModeChange,
  language,
  onLanguageChange,
}: ChatAreaProps) {
  const { strings: t, uiLanguage } = useLocale()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isNearBottomRef = useRef(true)

  const checkIfNearBottom = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return
    const threshold = 100
    isNearBottomRef.current =
      container.scrollHeight - container.scrollTop - container.clientHeight < threshold
  }, [])

  useEffect(() => {
    if (isNearBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading])

  const lastMessage = messages[messages.length - 1]
  const isStreaming = lastMessage?.role === 'assistant' && lastMessage.streaming === true
  const hasOnlyWelcome = messages.length === 0

  const welcomeMessage = useMemo<ChatMessage>(
    () => ({
      id: 'welcome',
      role: 'assistant',
      content: t.welcome,
      sources: [],
      timestamp: new Date(),
      language: uiLanguage,
    }),
    [t, uiLanguage]
  )

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      <header className="hidden lg:flex items-center justify-between px-6 py-3.5 border-b border-border bg-white/80 backdrop-blur-sm shrink-0">
        <h2 className="text-[15px] font-bold text-text-primary tracking-tight">JWChat</h2>
        <button
          type="button"
          aria-label={t.settings}
          className="p-2 rounded-xl hover:bg-black/[0.04] transition-colors cursor-pointer"
        >
          <Settings className="w-[18px] h-[18px] text-text-secondary" strokeWidth={1.8} />
        </button>
      </header>

      <div
        ref={scrollContainerRef}
        onScroll={checkIfNearBottom}
        role="log"
        aria-label={t.chatMessages}
        className="flex-1 overflow-y-auto bg-chat-bg relative"
      >
        {hasOnlyWelcome && (
          <div className="absolute inset-0 flex items-center justify-center">
            <JWWatermark />
          </div>
        )}

        <div className="relative z-10 py-6 space-y-5 max-w-3xl mx-auto">
          <MessageBubble message={welcomeMessage} />
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isLoading && !isStreaming && (
            <div className="flex gap-3 px-6" aria-label={t.thinking} role="status">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <BookOpenCheck className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
              <div className="bg-white rounded-2xl rounded-bl-md border border-border px-5 py-4 shadow-sm">
                <div className="flex gap-1.5" aria-hidden="true">
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="sr-only">{t.generating}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput
        onSend={onSend}
        isLoading={isLoading}
        mode={mode}
        onModeChange={onModeChange}
        language={language}
        onLanguageChange={onLanguageChange}
      />
    </div>
  )
}
