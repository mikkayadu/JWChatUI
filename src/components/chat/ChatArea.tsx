import { AuiIf, ThreadPrimitive } from '@assistant-ui/react'
import { ArrowDown, Settings } from 'lucide-react'
import type { ThinkingMode } from '../../api/chat'
import { AssistantMessage, EditComposer, UserMessage, WelcomeMessage } from './MessageBubble'
import ChatInput from './ChatInput'
import { JWWatermark } from '../JWLogo'
import { useLocale } from '../../i18n/locale'

interface ChatAreaProps {
  mode: ThinkingMode
  onModeChange: (mode: ThinkingMode) => void
  includeCitations: boolean
  onIncludeCitationsChange: (include: boolean) => void
  language: string
  onLanguageChange: (code: string) => void
}

const MESSAGE_COMPONENTS = { UserMessage, AssistantMessage, EditComposer }

function Suggestions() {
  const { strings: t } = useLocale()
  return (
    <div className="grid gap-2 sm:grid-cols-2 px-3 sm:px-6 sm:pl-[68px] animate-fade-in-up">
      {t.suggestions.map(prompt => (
        <ThreadPrimitive.Suggestion
          key={prompt}
          prompt={prompt}
          send
          className="text-left text-[13px] leading-snug text-text-primary bg-white rounded-xl border border-border px-4 py-3 shadow-sm hover:border-primary/40 hover:text-primary transition-colors cursor-pointer"
        >
          {prompt}
        </ThreadPrimitive.Suggestion>
      ))}
    </div>
  )
}

export default function ChatArea(props: ChatAreaProps) {
  const { strings: t } = useLocale()

  return (
    <ThreadPrimitive.Root className="flex-1 flex flex-col min-w-0 h-full">
      <header className="hidden lg:flex items-center justify-between px-6 py-3.5 border-b border-border bg-white/80 backdrop-blur-sm shrink-0">
        <h2 className="text-[15px] font-bold text-text-primary tracking-tight">JWChat</h2>
        <button
          type="button"
          aria-label={t.settings}
          className="p-2 rounded-xl hover:bg-black/[0.04] transition-colors cursor-pointer"
        >
          <Settings className="w-[18px] h-[18px] text-text-secondary" strokeWidth={1.8} />
        </button>
      </header>

      <ThreadPrimitive.Viewport className="flex-1 flex flex-col overflow-y-auto bg-chat-bg relative">
        <AuiIf condition={s => s.thread.isEmpty}>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <JWWatermark />
          </div>
        </AuiIf>

        <div role="log" aria-label={t.chatMessages} className="relative z-10 flex-1 w-full py-6 space-y-5 max-w-3xl mx-auto">
          <WelcomeMessage />
          <AuiIf condition={s => s.thread.isEmpty}>
            <Suggestions />
          </AuiIf>
          <ThreadPrimitive.Messages components={MESSAGE_COMPONENTS} />
        </div>

        <ThreadPrimitive.ViewportFooter className="sticky bottom-0 z-20 bg-chat-bg">
          <div className="relative max-w-3xl mx-auto">
            <ThreadPrimitive.ScrollToBottom
              aria-label={t.scrollToBottom}
              title={t.scrollToBottom}
              className="absolute -top-11 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white border border-border shadow-md flex items-center justify-center text-text-secondary hover:text-primary transition-all cursor-pointer disabled:invisible disabled:opacity-0"
            >
              <ArrowDown className="w-4 h-4" strokeWidth={2} />
            </ThreadPrimitive.ScrollToBottom>
          </div>
          <ChatInput {...props} />
        </ThreadPrimitive.ViewportFooter>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  )
}
