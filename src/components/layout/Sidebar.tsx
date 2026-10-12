import {
  Plus,
  Clock,
  BookOpen,
  Bookmark,
  ExternalLink,
  Settings,
  HelpCircle,
  X,
} from 'lucide-react'
import JWLogo from '../JWLogo'
import { useLocale } from '../../i18n/locale'

interface SidebarProps {
  onNewStudy: () => void
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ onNewStudy, isOpen, onClose }: SidebarProps) {
  const { strings: t } = useLocale()
  const navItems = [
    { icon: Clock, label: t.nav.history },
    { icon: BookOpen, label: t.nav.library },
    { icon: Bookmark, label: t.nav.saved },
  ]

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-[260px] bg-sidebar flex flex-col h-full shrink-0
          transform transition-transform duration-200 ease-in-out
          lg:relative lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="px-4 pt-5 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <JWLogo size={36} className="text-primary-light" />
            <div>
              <h1 className="text-white text-[15px] font-bold leading-tight tracking-tight">JWChat</h1>
              <p className="text-white/40 text-[11px] leading-tight">{t.tagline}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeSidebar}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 lg:hidden cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-3 mb-2">
          <button
            type="button"
            onClick={() => { onNewStudy(); onClose() }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white text-sm font-semibold transition-all cursor-pointer shadow-sm shadow-primary/20"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            {t.newStudy}
          </button>
        </div>

        <nav className="flex-1 px-3 py-1 space-y-0.5" aria-label={t.mainNavigation}>
          {navItems.map(({ icon: Icon, label }) => (
            <button
              type="button"
              key={label}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:bg-white/[0.08] hover:text-white/90 text-[13px] transition-all cursor-pointer"
            >
              <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
              {label}
            </button>
          ))}
        </nav>

        <div className="px-3 mb-3">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 text-white/60 hover:text-white/80 hover:border-white/25 hover:bg-white/[0.05] text-[13px] font-medium transition-all cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" strokeWidth={1.8} />
            {t.viewResources}
          </button>
        </div>

        <div className="border-t border-white/[0.08] px-3 py-2.5 space-y-0.5">
          <button
            type="button"
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-white/50 hover:bg-white/[0.08] hover:text-white/80 text-[13px] transition-all cursor-pointer"
          >
            <Settings className="w-[18px] h-[18px]" strokeWidth={1.8} />
            {t.settings}
          </button>
          <button
            type="button"
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-white/50 hover:bg-white/[0.08] hover:text-white/80 text-[13px] transition-all cursor-pointer"
          >
            <HelpCircle className="w-[18px] h-[18px]" strokeWidth={1.8} />
            {t.help}
          </button>
        </div>
      </aside>
    </>
  )
}
