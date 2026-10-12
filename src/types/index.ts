export interface SourceItem {
  source: string
  score: number
  snippet: string
}

export interface EnsembleCandidateInfo {
  name: string
  duration_ms: number
  error: boolean
}

export interface EnsembleMetadata {
  winning_strategy: string | null
  vote_count: number
  total_candidates: number
  cluster_sizes: number[]
  total_duration_ms: number
  candidate_strategies: EnsembleCandidateInfo[]
}

export interface ChatResponse {
  answer: string
  sources: SourceItem[]
  ensemble_metadata: EnsembleMetadata | null
  answer_language: string
  used_fallback: boolean
}

/** The stream's `meta` event, sent before `sources` when the request has a `language`. */
export interface ChatMeta {
  answer_language: string
  /** True when answer-language sources were thin and English ones were added. */
  used_fallback: boolean
}

/** An enabled answer language, from GET /api/languages. */
export interface LanguageInfo {
  code: string
  native_name: string
  /** The 66 Bible book names in this language; index = book number - 1. */
  book_names: string[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources: SourceItem[]
  timestamp: Date
  streaming?: boolean
  /** Language the assistant answered in; unset for user messages and older backends. */
  language?: string
}
