import { useCallback, useEffect, useState } from 'react'
import type { ChatMessage } from '../types'

const STORAGE_KEY = 'jwchat.threads.v1'
const TITLE_LENGTH = 60
// Streaming patches state on every token; batch the localStorage writes.
const SAVE_DELAY_MS = 400

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export interface ThreadMeta {
  id: string
  /** The first question, shortened; unset until one is asked. */
  title?: string
  updatedAt: number
}

interface ThreadsState {
  /** Most recently active first. */
  threads: ThreadMeta[]
  messages: Record<string, ChatMessage[]>
  currentId: string
}

function emptyState(): ThreadsState {
  const id = generateId()
  return { threads: [{ id, updatedAt: Date.now() }], messages: { [id]: [] }, currentId: id }
}

function titleFor(question: string): string {
  const oneLine = question.replace(/\s+/g, ' ').trim()
  return oneLine.length > TITLE_LENGTH ? oneLine.slice(0, TITLE_LENGTH - 1).trimEnd() + '…' : oneLine
}

/** The saved threads, or a single empty thread if storage is empty, blocked or corrupt. */
function loadState(): ThreadsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    const saved = JSON.parse(raw) as ThreadsState
    if (!Array.isArray(saved.threads) || saved.threads.length === 0 || typeof saved.messages !== 'object') {
      return emptyState()
    }
    const messages: Record<string, ChatMessage[]> = {}
    for (const thread of saved.threads) {
      messages[thread.id] = (saved.messages[thread.id] ?? []).map(m => ({
        ...m,
        timestamp: new Date(m.timestamp),
        // A stream cut off by a page reload never finishes.
        streaming: false,
      }))
    }
    const currentId = saved.threads.some(t => t.id === saved.currentId) ? saved.currentId : saved.threads[0].id
    return { threads: saved.threads, messages, currentId }
  } catch {
    return emptyState()
  }
}

/** Moves a thread to the front of the list and bumps its activity time. */
function touch(threads: ThreadMeta[], id: string, patch: Partial<ThreadMeta> = {}): ThreadMeta[] {
  const thread = threads.find(t => t.id === id)
  if (!thread) return threads
  return [{ ...thread, ...patch, updatedAt: Date.now() }, ...threads.filter(t => t.id !== id)]
}

/** Drops the current thread when it's still empty, so abandoned "new" threads don't pile up. */
function withoutEmptyCurrent(state: ThreadsState): ThreadsState {
  const { currentId } = state
  if ((state.messages[currentId] ?? []).length > 0) return state
  const messages = { ...state.messages }
  delete messages[currentId]
  return { ...state, threads: state.threads.filter(t => t.id !== currentId), messages }
}

/**
 * Conversations and their messages, persisted to localStorage. Message
 * updates take a thread id, so a stream keeps writing to the thread it
 * started in even after the user switches to another one.
 */
export function useThreads() {
  const [state, setState] = useState(loadState)

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch {
        // Private mode, blocked or full storage: history just won't persist.
      }
    }, SAVE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [state])

  const appendMessage = useCallback((threadId: string, message: ChatMessage) => {
    setState(prev => {
      if (!prev.messages[threadId]) return prev
      const thread = prev.threads.find(t => t.id === threadId)
      const title = !thread?.title && message.role === 'user' ? titleFor(message.content) : thread?.title
      return {
        ...prev,
        threads: touch(prev.threads, threadId, { title }),
        messages: { ...prev.messages, [threadId]: [...prev.messages[threadId], message] },
      }
    })
  }, [])

  const patchMessage = useCallback((threadId: string, messageId: string, patch: Partial<ChatMessage>) => {
    setState(prev => {
      const list = prev.messages[threadId]
      if (!list?.some(m => m.id === messageId)) return prev
      return {
        ...prev,
        messages: { ...prev.messages, [threadId]: list.map(m => (m.id === messageId ? { ...m, ...patch } : m)) },
      }
    })
  }, [])

  /** Keeps messages up to and including `messageId`; `null` empties the thread. */
  const truncateAfter = useCallback((threadId: string, messageId: string | null) => {
    setState(prev => {
      const list = prev.messages[threadId]
      if (!list) return prev
      const keep = messageId === null ? 0 : list.findIndex(m => m.id === messageId) + 1
      return { ...prev, messages: { ...prev.messages, [threadId]: list.slice(0, keep) } }
    })
  }, [])

  const createThread = useCallback(() => {
    setState(prev => {
      if ((prev.messages[prev.currentId] ?? []).length === 0) return prev
      const id = generateId()
      return {
        threads: [{ id, updatedAt: Date.now() }, ...prev.threads],
        messages: { ...prev.messages, [id]: [] },
        currentId: id,
      }
    })
  }, [])

  const switchThread = useCallback((id: string) => {
    setState(prev => {
      if (id === prev.currentId || !prev.messages[id]) return prev
      return { ...withoutEmptyCurrent(prev), currentId: id }
    })
  }, [])

  const renameThread = useCallback((id: string, title: string) => {
    setState(prev => ({ ...prev, threads: prev.threads.map(t => (t.id === id ? { ...t, title } : t)) }))
  }, [])

  const deleteThread = useCallback((id: string) => {
    setState(prev => {
      const threads = prev.threads.filter(t => t.id !== id)
      if (threads.length === 0) return emptyState()
      const messages = { ...prev.messages }
      delete messages[id]
      return { threads, messages, currentId: id === prev.currentId ? threads[0].id : prev.currentId }
    })
  }, [])

  return {
    threads: state.threads,
    currentThreadId: state.currentId,
    messagesByThread: state.messages,
    currentMessages: state.messages[state.currentId] ?? [],
    appendMessage,
    patchMessage,
    truncateAfter,
    createThread,
    switchThread,
    renameThread,
    deleteThread,
  }
}
