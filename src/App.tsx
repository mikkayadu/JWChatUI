import { useState, useCallback } from 'react'
import { AssistantRuntimeProvider } from '@assistant-ui/react'
import { Menu, BookOpen } from 'lucide-react'
import Sidebar from './components/layout/Sidebar'
import ChatArea from './components/chat/ChatArea'
import ReferencesPanel from './components/layout/ReferencesPanel'
import { useJWRuntime } from './hooks/useJWRuntime'
import { useLanguage } from './hooks/useLanguage'
import { LocaleContext } from './i18n/locale'

export default function App() {
  const { locale, language, setLanguage, requestLanguage } = useLanguage()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [referencesOpen, setReferencesOpen] = useState(false)
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])
  const closeReferences = useCallback(() => setReferencesOpen(false), [])
  const { runtime, activeSources, mode, setMode, includeCitations, setIncludeCitations } = useJWRuntime(
    requestLanguage,
    locale,
    closeReferences
  )
  const t = locale.strings

  return (
    <LocaleContext value={locale}>
      <AssistantRuntimeProvider runtime={runtime}>
        <div className="h-full flex overflow-hidden bg-chat-bg">
          <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

          <div className="flex-1 flex flex-col min-w-0 h-full">
            <div className="flex items-center gap-2 px-4 py-2.5 lg:hidden border-b border-border bg-white/80 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label={t.openSidebar}
                className="p-2 rounded-xl hover:bg-black/[0.04] cursor-pointer transition-colors"
              >
                <Menu className="w-5 h-5 text-text-secondary" strokeWidth={1.8} />
              </button>
              <span className="flex-1 text-center text-[13px] font-bold text-text-primary tracking-tight">JWChat</span>
              <button
                type="button"
                onClick={() => setReferencesOpen(true)}
                aria-label={t.openReferences}
                className="p-2 rounded-xl hover:bg-black/[0.04] cursor-pointer relative transition-colors"
              >
                <BookOpen className="w-5 h-5 text-text-secondary" strokeWidth={1.8} />
                {activeSources.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-orange rounded-full" />
                )}
              </button>
            </div>

            <ChatArea
              mode={mode}
              onModeChange={setMode}
              includeCitations={includeCitations}
              onIncludeCitationsChange={setIncludeCitations}
              language={language}
              onLanguageChange={setLanguage}
            />
          </div>

          <ReferencesPanel sources={activeSources} isOpen={referencesOpen} onClose={closeReferences} />
        </div>
      </AssistantRuntimeProvider>
    </LocaleContext>
  )
}
