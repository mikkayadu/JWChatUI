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
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources: SourceItem[]
  timestamp: Date
  streaming?: boolean
}
