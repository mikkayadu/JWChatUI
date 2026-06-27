import { MapPin, X } from 'lucide-react'
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
          className="fixed inset-0 bg-black/40 z-30 xl:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 right-0 z-40 w-72 border-l border-border bg-white flex flex-col h-full shrink-0
          transform transition-transform duration-200 ease-in-out
          xl:relative xl:translate-x-0
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-text-primary">References</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close references"
            className="p-1 rounded-md hover:bg-gray-100 text-text-muted xl:hidden cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {sources.length === 0 ? (
            <div className="text-center py-12 px-2">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-5 h-5 text-text-muted" />
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Source references will appear here when you ask a question.
              </p>
            </div>
          ) : (
            sources.map((source, i) => (
              <ReferenceCard key={`${source.source}-${i}`} source={source} index={i + 1} />
            ))
          )}
        </div>
      </aside>
    </>
  )
}
