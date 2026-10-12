import { useEffect, useState } from 'react'
import { FileText, BookOpen, Newspaper, Video, ExternalLink } from 'lucide-react'
import type { SourceItem } from '../../types'
import { fetchOgImage } from '../../api/chat'
import type { UiStrings } from '../../i18n/strings'
import { useLocale } from '../../i18n/locale'
import { classifySource } from '../../utils/jwUrl'

interface ReferenceCardProps {
  source: SourceItem
}

function extractSourceInfo(
  sourceUrl: string,
  t: UiStrings
): { type: string; publication: string; icon: typeof FileText } {
  const { kind, host } = classifySource(sourceUrl)
  const type = t.sourceTypes[kind]
  switch (kind) {
    case 'book':
      return { type, publication: `jw.org — ${t.sourceSections.books}`, icon: BookOpen }
    case 'magazine':
      return { type, publication: `jw.org — ${t.sourceSections.magazines}`, icon: Newspaper }
    case 'video':
      return { type, publication: `jw.org — ${t.sourceSections.videos}`, icon: Video }
    case 'teaching':
    case 'article':
      return { type, publication: 'jw.org', icon: FileText }
    case 'source':
      return { type, publication: host || type, icon: FileText }
  }
}

export default function ReferenceCard({ source }: ReferenceCardProps) {
  const { strings: t } = useLocale()
  const { type, publication, icon: TypeIcon } = extractSourceInfo(source.source, t)
  const score = (source.score * 100).toFixed(0)
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchOgImage(source.source).then(img => {
      if (!cancelled) setThumbnail(img)
    })
    return () => { cancelled = true }
  }, [source.source])

  const showImage = thumbnail && !imgError

  return (
    <a
      href={source.source}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-3 p-3 rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all no-underline cursor-pointer"
    >
      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-sidebar to-sidebar-active flex items-center justify-center">
        {showImage ? (
          <img
            src={thumbnail}
            alt=""
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <TypeIcon className="w-6 h-6 text-blue-200" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold tracking-wider uppercase text-accent-orange">
            {type}
          </span>
          <span className="text-[10px] text-text-muted">{score}%</span>
        </div>
        <p className="text-xs font-semibold text-text-primary leading-snug line-clamp-2 mb-1 m-0">
          {source.snippet.slice(0, 100)}...
        </p>
        <p className="text-[11px] text-text-secondary truncate m-0 flex items-center gap-1">
          {publication}
          <ExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
        </p>
      </div>
    </a>
  )
}
