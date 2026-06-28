import { BookOpen, X } from 'lucide-react'
import type { SourceItem } from '../../types'
import ReferenceCard from '../references/ReferenceCard'

interface ReferencesPanelProps {
  sources: SourceItem[]
  isOpen: boolean
  onClose: () => void
}

export default function ReferencesPanel({ sources, isOpen, onClose }: ReferencesPanelProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 xl:hidden backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 right-0 z-40 w-[300px] border-l border-border bg-white flex flex-col h-full shrink-0
          transform transition-transform duration-200 ease-in-out
          xl:relative xl:translate-x-0
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" strokeWidth={1.8} />
            <h2 className="text-[13px] font-bold text-text-primary tracking-tight">References</h2>
            {sources.length > 0 && (
              <span className="text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                {sources.length}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close references"
            className="p-1.5 rounded-lg hover:bg-black/[0.04] text-text-muted xl:hidden cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {sources.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-14 h-14 rounded-2xl bg-chat-bg flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-text-muted" strokeWidth={1.5} />
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Source references will appear here when you ask a question.
              </p>
            </div>
          ) : (
            sources.map((source, i) => (
              <ReferenceCard key={`${source.source}-${i}`} source={source} />
            ))
          )}
        </div>
      </aside>
    </>
  )
}
