import { useState, useCallback, useRef } from 'react'
import type { ChatMessage, SourceItem } from '../types'
import { sendMessageStream } from '../api/chat'
import type { ThinkingMode } from '../api/chat'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function createWelcomeMessage(): ChatMessage {
  return {
    id: 'welcome',
    role: 'assistant',
    content:
      'Welcome to your study session. I am here to assist you with biblical research. How may I help you explore the Scriptures today?',
    sources: [],
    timestamp: new Date(),
  }
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [createWelcomeMessage()])
  const [isLoading, setIsLoading] = useState(false)
  const [activeSources, setActiveSources] = useState<SourceItem[]>([])
  const [mode, setMode] = useState<ThinkingMode>('normal')
  const abortControllerRef = useRef<AbortController | null>(null)

  const send = useCallback(async (question: string, includeCitations: boolean) => {
    abortControllerRef.current?.abort()

    const controller = new AbortController()
    abortControllerRef.current = controller

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: question,
      sources: [],
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setActiveSources([])

    // The assistant message is created lazily on the first token so the "thinking"
    // indicator shows until generation actually starts streaming.
    const assistantId = generateId()
    let created = false
    let accumulated = ''
    let pendingSources: SourceItem[] = []

    const ensureCreated = () => {
      if (created) return
      created = true
      setMessages(prev => [
        ...prev,
        {
          id: assistantId,
          role: 'assistant',
          content: '',
          sources: pendingSources,
          timestamp: new Date(),
          streaming: true,
        },
      ])
    }

    const patchAssistant = (patch: Partial<ChatMessage>) =>
      setMessages(prev => prev.map(m => (m.id === assistantId ? { ...m, ...patch } : m)))

    try {
      const topK = includeCitations ? 5 : 3
      await sendMessageStream(
        question,
        topK,
        mode,
        {
          onSources: sources => {
            pendingSources = sources
            setActiveSources(sources)
            patchAssistant({ sources })
          },
          onToken: text => {
            ensureCreated()
            accumulated += text
            patchAssistant({ content: accumulated })
          },
          onError: detail => {
            ensureCreated()
            // Keep any partial answer already streamed; otherwise show the
            // backend's (user-friendly) error message as-is.
            patchAssistant({
              content:
                accumulated ||
                detail ||
                'I apologize, but I encountered an error processing your request. Please try again.',
              streaming: false,
            })
          },
        },
        controller.signal
      )

      // Stream ended with no content at all — surface a friendly fallback.
      if (!created) {
        ensureCreated()
        patchAssistant({ content: 'I could not generate a response.', streaming: false })
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        patchAssistant({ streaming: false })
        return
      }

      if (created) {
        patchAssistant({ streaming: false })
      } else {
        const errorMessage: ChatMessage = {
          id: assistantId,
          role: 'assistant',
          content:
            'I apologize, but I encountered an error processing your request. Please try again.',
          sources: [],
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } finally {
      patchAssistant({ streaming: false })
      if (!controller.signal.aborted) {
        setIsLoading(false)
      }
    }
  }, [mode])

  const clearChat = useCallback(() => {
    abortControllerRef.current?.abort()
    setMessages([createWelcomeMessage()])
    setActiveSources([])
    setIsLoading(false)
  }, [])

  return { messages, isLoading, activeSources, mode, setMode, send, clearChat }
}
