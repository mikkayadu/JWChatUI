import { FileText } from 'lucide-react'
import type { SourceItem } from '../../types'

interface ReferenceCardProps {
  source: SourceItem
  index: number
}

function extractSourceInfo(sourceUrl: string): { type: string; publication: string } {
  const url = sourceUrl.replace(/^https?:\/\//, '')

  if (url.includes('wol.jw.org')) {
    return { type: 'ARTICLE', publication: 'Watchtower Online Library' }
  }
  if (url.includes('jw.org')) {
    return { type: 'ARTICLE', publication: 'jw.org' }
  }

  const parts = url.split('/').filter(Boolean)
  const last = parts[parts.length - 1] || url
  const cleaned = last
    .replace(/[-_]/g, ' ')
    .replace(/\.\w+$/, '')
    .replace(/\b\w/g, c => c.toUpperCase())

  return { type: 'PUBLICATION', publication: cleaned }
}

export default function ReferenceCard({ source, index }: ReferenceCardProps) {
  const { type, publication } = extractSourceInfo(source.source)
  const score = (source.score * 100).toFixed(0)

  return (
    <div className="group flex gap-3 p-3 rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-sm transition-all cursor-default">
      <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-sidebar to-sidebar-active flex items-center justify-center shrink-0">
        <FileText className="w-6 h-6 text-blue-200" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold tracking-wider uppercase text-accent-orange">
            {type}
          </span>
          <span className="text-[10px] text-text-muted">{score}% match</span>
        </div>
        <p className="text-xs font-semibold text-text-primary leading-snug line-clamp-2 mb-1">
          [{index}] {source.snippet.slice(0, 80)}...
        </p>
        <p className="text-[11px] text-text-secondary truncate">{publication}</p>
      </div>
    </div>
  )
}
