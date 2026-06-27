import { useEffect, useRef, useCallback } from 'react'
import { Settings, BookOpenCheck } from 'lucide-react'
import type { ChatMessage } from '../../types'
import type { ThinkingMode } from '../../api/chat'
import MessageBubble from './MessageBubble'
import ChatInput from './ChatInput'

interface ChatAreaProps {
  messages: ChatMessage[]
  isLoading: boolean
  onSend: (message: string, includeCitations: boolean) => void
  mode: ThinkingMode
  onModeChange: (mode: ThinkingMode) => void
}

export default function ChatArea({ messages, isLoading, onSend, mode, onModeChange }: ChatAreaProps) {
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

  // Once tokens start arriving the answer renders in its own growing bubble, so
  // hide the separate "thinking" indicator to avoid showing both at once.
  const lastMessage = messages[messages.length - 1]
  const isStreaming = lastMessage?.role === 'assistant' && lastMessage.streaming === true

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      <header className="hidden lg:flex items-center justify-between px-6 py-4 border-b border-border bg-white shrink-0">
        <h2 className="text-lg font-bold text-text-primary">JWChat</h2>
        <button
          type="button"
          aria-label="Settings"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <Settings className="w-5 h-5 text-text-secondary" />
        </button>
      </header>

      <div
        ref={scrollContainerRef}
        onScroll={checkIfNearBottom}
        role="log"
        aria-label="Chat messages"
        className="flex-1 overflow-y-auto bg-chat-bg py-6 space-y-5"
      >
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isLoading && !isStreaming && (
          <div className="flex gap-3 px-6" aria-label="Thinking" role="status">
            <div className="w-8 h-8 rounded-full bg-sidebar flex items-center justify-center shrink-0">
              <BookOpenCheck className="w-4 h-4 text-blue-300" />
            </div>
            <div className="bg-assistant-bg rounded-2xl rounded-bl-md border border-border px-5 py-4 shadow-sm">
              <div className="flex gap-1.5" aria-hidden="true">
                <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="sr-only">Generating response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={onSend} isLoading={isLoading} mode={mode} onModeChange={onModeChange} />
    </div>
  )
}
