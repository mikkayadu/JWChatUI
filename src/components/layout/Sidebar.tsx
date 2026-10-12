import { useCallback } from 'react'
import { ThreadListItemPrimitive, ThreadListPrimitive } from '@assistant-ui/react'
import {
  Plus,
  BookOpen,
  Bookmark,
  ExternalLink,
  Settings,
  HelpCircle,
  MessageSquare,
  Trash2,
  X,
} from 'lucide-react'
import JWLogo from '../JWLogo'
import { useLocale } from '../../i18n/locale'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

function ThreadItem({ onSelect }: { onSelect: () => void }) {
  const { strings: t } = useLocale()
  return (
    <ThreadListItemPrimitive.Root className="group relative flex items-center rounded-xl text-white/60 hover:bg-white/[0.08] hover:text-white/90 data-[active=true]:bg-sidebar-active data-[active=true]:text-white transition-all">
      <ThreadListItemPrimitive.Trigger
        onClick={onSelect}
        className="flex-1 min-w-0 flex items-center gap-3 pl-4 pr-9 py-2 text-left text-[13px] cursor-pointer"
      >
        <MessageSquare className="w-4 h-4 shrink-0 opacity-70" strokeWidth={1.8} />
        <span className="truncate">
          <ThreadListItemPrimitive.Title fallback={t.newChatTitle} />
        </span>
      </ThreadListItemPrimitive.Trigger>
      <ThreadListItemPrimitive.Delete
        aria-label={t.deleteChat}
        title={t.deleteChat}
        className="absolute right-1.5 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity cursor-pointer"
      >
        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.8} />
      </ThreadListItemPrimitive.Delete>
    </ThreadListItemPrimitive.Root>
  )
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { strings: t } = useLocale()
  const renderThread = useCallback(() => <ThreadItem onSelect={onClose} />, [onClose])
  const navItems = [
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

        <ThreadListPrimitive.Root className="flex-1 min-h-0 flex flex-col">
          <div className="px-3 mb-2">
            <ThreadListPrimitive.New
              onClick={onClose}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white text-sm font-semibold transition-all cursor-pointer shadow-sm shadow-primary/20"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              {t.newStudy}
            </ThreadListPrimitive.New>
          </div>

          <nav className="px-3 py-1 space-y-0.5" aria-label={t.mainNavigation}>
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

          <h2 className="px-7 pt-4 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/35">
            {t.recentChats}
          </h2>
          <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-2 space-y-0.5">
            <ThreadListPrimitive.Items>{renderThread}</ThreadListPrimitive.Items>
          </div>
        </ThreadListPrimitive.Root>

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
