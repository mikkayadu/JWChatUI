import { useState, useCallback } from 'react'
import { Menu, BookOpen } from 'lucide-react'
import Sidebar from './components/layout/Sidebar'
import ChatArea from './components/chat/ChatArea'
import ReferencesPanel from './components/layout/ReferencesPanel'
import { useChat } from './hooks/useChat'

export default function App() {
  const { messages, isLoading, activeSources, mode, setMode, send, clearChat } = useChat()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [referencesOpen, setReferencesOpen] = useState(false)

  const handleSend = useCallback(
    (message: string, includeCitations: boolean) => {
      send(message, includeCitations)
      setReferencesOpen(false)
    },
    [send]
  )

  return (
    <div className="h-full flex overflow-hidden bg-white">
      <Sidebar
        onNewStudy={clearChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full">
        <div className="flex items-center gap-2 px-4 py-2 lg:hidden border-b border-border bg-white">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
            className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <Menu className="w-5 h-5 text-text-secondary" />
          </button>
          <span className="flex-1 text-center text-sm font-bold text-text-primary">JWChat</span>
          <button
            type="button"
            onClick={() => setReferencesOpen(true)}
            aria-label="Open references"
            className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer relative"
          >
            <BookOpen className="w-5 h-5 text-text-secondary" />
            {activeSources.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent-orange rounded-full" />
            )}
          </button>
        </div>

        <ChatArea messages={messages} isLoading={isLoading} onSend={handleSend} mode={mode} onModeChange={setMode} />
      </div>

      <ReferencesPanel
        sources={activeSources}
        isOpen={referencesOpen}
        onClose={() => setReferencesOpen(false)}
      />
    </div>
  )
}
