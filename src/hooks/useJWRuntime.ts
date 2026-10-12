import { useState, useCallback, useRef } from 'react'
import {
  useExternalStoreRuntime,
  type AppendMessage,
  type ExternalStoreThreadListAdapter,
  type FeedbackAdapter,
  type ThreadMessageLike,
} from '@assistant-ui/react'
import type { ChatMessage, SourceItem } from '../types'
import { AUTO_LANGUAGE, ApiError, sendMessageStream } from '../api/chat'
import type { StreamCallbacks, ThinkingMode } from '../api/chat'
import type { Locale } from '../i18n/locale'
import { generateId, useThreads } from './useThreads'

/** What assistant-ui renders for one of our messages. Module-level so the
 * runtime's per-message conversion cache stays valid across renders. */
function convertMessage(message: ChatMessage): ThreadMessageLike {
  return {
    id: message.id,
    role: message.role,
    createdAt: message.timestamp,
    content: [{ type: 'text', text: message.content }],
    status:
      message.role === 'assistant'
        ? message.streaming
          ? { type: 'running' }
          : { type: 'complete', reason: 'stop' }
        : undefined,
    metadata: {
      custom: { sources: message.sources, language: message.language },
      submittedFeedback: message.feedback ? { type: message.feedback } : undefined,
    },
  }
}

function textOf(message: AppendMessage): string {
  return message.content
    .map(part => (part.type === 'text' ? part.text : ''))
    .join('\n')
    .trim()
}

/**
 * The assistant-ui runtime over our own thread store and SSE client.
 * `requestLanguage` gives the `language` to send ("auto" or an enabled code);
 * `refresh` re-checks the enabled languages. `locale` supplies the fallback
 * texts shown on failure. `onSend` runs whenever a question is sent.
 */
export function useJWRuntime(
  requestLanguage: (refresh?: boolean) => Promise<string>,
  locale: Locale,
  onSend?: () => void
) {
  const {
    threads,
    currentThreadId,
    currentMessages,
    appendMessage,
    patchMessage,
    truncateAfter,
    createThread,
    switchThread,
    renameThread,
    deleteThread,
  } = useThreads()
  const [mode, setMode] = useState<ThinkingMode>('normal')
  const [includeCitations, setIncludeCitations] = useState(true)
  // The thread whose answer is streaming, if any. One stream at a time.
  const [runningThreadId, setRunningThreadId] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  /** Streams an answer to `question` onto the end of `threadId`. */
  const answer = useCallback(async (threadId: string, question: string) => {
    abortControllerRef.current?.abort()

    const controller = new AbortController()
    abortControllerRef.current = controller
    setRunningThreadId(threadId)
    onSend?.()

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
      appendMessage(threadId, {
        id: assistantId,
        role: 'assistant',
        content: '',
        sources: pendingSources,
        timestamp: new Date(),
        streaming: true,
        language: answerLanguage,
      })
    }

    const patchAssistant = (patch: Partial<ChatMessage>) => patchMessage(threadId, assistantId, patch)

    const callbacks: StreamCallbacks = {
      onMeta: meta => {
        answerLanguage = meta.answer_language
      },
      onSources: sources => {
        pendingSources = sources
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
        // A 422 can mean the backend no longer enables the chosen language
        // (e.g. after a deploy); re-check the enabled list and retry once.
        if (!(error instanceof ApiError && error.status === 422)) throw error
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
        appendMessage(threadId, {
          id: assistantId,
          role: 'assistant',
          content: strings.errorGeneric,
          sources: [],
          timestamp: new Date(),
          language: uiLanguage,
        })
      }
    } finally {
      patchAssistant({ streaming: false })
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null
        setRunningThreadId(null)
      }
    }
  }, [mode, includeCitations, requestLanguage, locale, onSend, appendMessage, patchMessage])

  const ask = useCallback(
    (threadId: string, question: string) => {
      appendMessage(threadId, {
        id: generateId(),
        role: 'user',
        content: question,
        sources: [],
        timestamp: new Date(),
      })
      return answer(threadId, question)
    },
    [appendMessage, answer]
  )

  const cancel = useCallback(async () => {
    abortControllerRef.current?.abort()
  }, [])

  const feedback: FeedbackAdapter = {
    // Stored with the message only; no backend endpoint takes feedback yet.
    // TODO: POST it to the backend once one exists.
    submit: ({ message, type }) => patchMessage(currentThreadId, message.id, { feedback: type }),
  }

  const threadList: ExternalStoreThreadListAdapter = {
    threadId: currentThreadId,
    threads: threads.map(t => ({ id: t.id, status: 'regular', title: t.title })),
    archivedThreads: [],
    onSwitchToNewThread: createThread,
    onSwitchToThread: switchThread,
    onRename: renameThread,
    onDelete: id => {
      if (id === runningThreadId) abortControllerRef.current?.abort()
      deleteThread(id)
    },
  }

  const runtime = useExternalStoreRuntime({
    messages: currentMessages,
    convertMessage,
    isRunning: runningThreadId === currentThreadId,
    onNew: async message => {
      const question = textOf(message)
      if (question) await ask(currentThreadId, question)
    },
    onEdit: async message => {
      const question = textOf(message)
      if (!question) return
      // No branches: the edited question replaces it and everything after.
      truncateAfter(currentThreadId, message.parentId)
      await ask(currentThreadId, question)
    },
    onReload: async parentId => {
      const question = currentMessages.find(m => m.id === parentId && m.role === 'user')
      if (!question) return
      truncateAfter(currentThreadId, question.id)
      await answer(currentThreadId, question.content)
    },
    onCancel: cancel,
    adapters: { feedback, threadList },
  })

  // The References panel follows the latest answer in the open thread.
  const last = currentMessages[currentMessages.length - 1]
  const activeSources = last?.role === 'assistant' ? last.sources : []

  return { runtime, activeSources, mode, setMode, includeCitations, setIncludeCitations }
}
