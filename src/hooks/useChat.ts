import { useState, useCallback, useRef } from 'react'
import type { ChatMessage, SourceItem } from '../types'
import { AUTO_LANGUAGE, ApiError, sendMessageStream } from '../api/chat'
import type { StreamCallbacks, ThinkingMode } from '../api/chat'
import type { Locale } from '../i18n/locale'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

/**
 * Chat state and sending. `requestLanguage` gives the `language` to send
 * ("auto" or an enabled code); `refresh` re-checks the enabled languages.
 * `locale` supplies the fallback texts shown on failure. The welcome message
 * isn't part of `messages`; ChatArea renders it so it follows the UI language.
 */
export function useChat(requestLanguage: (refresh?: boolean) => Promise<string>, locale: Locale) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
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
    let language: string = AUTO_LANGUAGE
    // From the `meta` event, which arrives before the message is created.
    let answerLanguage: string | undefined
    const { strings, uiLanguage } = locale

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
          language: answerLanguage,
        },
      ])
    }

    const patchAssistant = (patch: Partial<ChatMessage>) =>
      setMessages(prev => prev.map(m => (m.id === assistantId ? { ...m, ...patch } : m)))

    const callbacks: StreamCallbacks = {
      onMeta: meta => {
        answerLanguage = meta.answer_language
      },
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
        // backend's (user-friendly) error message as-is. The backend writes
        // it in the answer language, or the requested one if it never got
        // that far.
        const requested = language === AUTO_LANGUAGE ? 'en' : language
        patchAssistant(
          accumulated
            ? { streaming: false }
            : detail
              ? { content: detail, language: answerLanguage ?? requested, streaming: false }
              : { content: strings.errorGeneric, language: uiLanguage, streaming: false }
        )
      },
    }

    try {
      const topK = includeCitations ? 5 : 3
      const stream = () => sendMessageStream(question, topK, mode, language, callbacks, controller.signal)

      language = await requestLanguage()
      try {
        await stream()
      } catch (error) {
        // A 422 on `language` means the backend no longer enables the chosen
        // language (e.g. after a deploy); re-check the enabled list and retry
        // once. Other 422s (e.g. a too-short question) won't pass on retry.
        if (!(error instanceof ApiError && error.status === 422 && error.fields.includes('language'))) throw error
        const refreshed = await requestLanguage(true)
        if (refreshed === language) throw error
        language = refreshed
        await stream()
      }

      // Stream ended with no content at all — surface a friendly fallback.
      if (!created) {
        ensureCreated()
        patchAssistant({ content: strings.noResponse, language: uiLanguage, streaming: false })
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
          content: strings.errorGeneric,
          sources: [],
          timestamp: new Date(),
          language: uiLanguage,
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } finally {
      patchAssistant({ streaming: false })
      if (!controller.signal.aborted) {
        setIsLoading(false)
      }
    }
  }, [mode, requestLanguage, locale])

  const clearChat = useCallback(() => {
    abortControllerRef.current?.abort()
    setMessages([])
    setActiveSources([])
    setIsLoading(false)
  }, [])

  return { messages, isLoading, activeSources, mode, setMode, send, clearChat }
}
