import {
  Plus,
  Clock,
  BookOpen,
  Bookmark,
  ExternalLink,
  Settings,
  HelpCircle,
  BookOpenCheck,
  X,
} from 'lucide-react'

interface SidebarProps {
  onNewStudy: () => void
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { icon: Clock, label: 'Recent History' },
  { icon: BookOpen, label: 'Library' },
  { icon: Bookmark, label: 'Saved Insights' },
]

export default function Sidebar({ onNewStudy, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-56 bg-sidebar flex flex-col h-full shrink-0
          transform transition-transform duration-200 ease-in-out
          lg:relative lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="px-4 pt-5 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-sidebar-active flex items-center justify-center">
              <BookOpenCheck className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h1 className="text-white text-[15px] font-bold leading-tight">JWChat</h1>
              <p className="text-blue-300/70 text-[11px] leading-tight">Deep Spiritual Research</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="p-1 rounded-md hover:bg-sidebar-hover text-blue-200/70 lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-3 mb-1">
          <button
            type="button"
            onClick={() => {
              onNewStudy()
              onClose()
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Study
          </button>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-0.5" aria-label="Main navigation">
          {navItems.map(({ icon: Icon, label }) => (
            <button
              type="button"
              key={label}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-blue-200/80 hover:bg-sidebar-hover hover:text-white text-sm transition-colors cursor-pointer"
            >
              <Icon className="w-[18px] h-[18px]" />
              {label}
            </button>
          ))}
        </nav>

        <div className="px-3 mb-3">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-accent-blue/50 text-accent-blue hover:bg-sidebar-hover text-sm font-medium transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            View Resources
          </button>
        </div>

        <div className="border-t border-white/10 px-3 py-2 space-y-0.5">
          <button
            type="button"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-blue-200/70 hover:bg-sidebar-hover hover:text-white text-sm transition-colors cursor-pointer"
          >
            <Settings className="w-[18px] h-[18px]" />
            Settings
          </button>
          <button
            type="button"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-blue-200/70 hover:bg-sidebar-hover hover:text-white text-sm transition-colors cursor-pointer"
          >
            <HelpCircle className="w-[18px] h-[18px]" />
            Help
          </button>
        </div>
      </aside>
    </>
  )
}
