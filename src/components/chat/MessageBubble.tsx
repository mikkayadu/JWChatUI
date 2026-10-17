import type { ReactNode } from 'react'
import {
  ActionBarPrimitive,
  AuiIf,
  ComposerPrimitive,
  MessagePrimitive,
  useAuiState,
  type AssistantState,
  type TextMessagePartComponent,
} from '@assistant-ui/react'
import { BookOpenCheck, Check, Copy, Pencil, RefreshCw, ThumbsDown, ThumbsUp } from 'lucide-react'
import type { SourceItem } from '../../types'
import { useLocale } from '../../i18n/locale'
import { useCanHover } from '../../hooks/useCanHover'
import AnswerContent from './AnswerContent'

const NO_SOURCES: SourceItem[] = []

const ACTION_BUTTON =
  'group p-1.5 pointer-coarse:p-2 rounded-lg text-text-muted hover:text-primary hover:bg-black/[0.04] transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none data-[submitted=true]:text-primary'

function AssistantAvatar() {
  return (
    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
      <BookOpenCheck className="w-4 h-4 text-white" strokeWidth={2} />
    </div>
  )
}

function AssistantBubble({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-full bg-white rounded-2xl rounded-bl-sm border border-border/60 px-4 py-3 sm:px-5 sm:py-4 shadow-sm">
      {children}
    </div>
  )
}

/** The greeting shown at the top of every thread; not a runtime message. */
export function WelcomeMessage() {
  const { strings: t, uiLanguage } = useLocale()
  return (
    <div className="flex gap-2 sm:gap-3 px-3 sm:px-6">
      <AssistantAvatar />
      <div className="min-w-0 max-w-[calc(100%-2.25rem)] sm:max-w-[80%]">
        <AssistantBubble>
          <AnswerContent content={t.welcome} sources={NO_SOURCES} language={uiLanguage} />
        </AssistantBubble>
      </div>
    </div>
  )
}

/** The answer text part, rendered with our citation and scripture handling. */
const AnswerText: TextMessagePartComponent = ({ text, status }) => {
  const sources = useAuiState(s => s.message.metadata.custom?.sources as SourceItem[] | undefined)
  const language = useAuiState(s => s.message.metadata.custom?.language as string | undefined)
  return (
    <AnswerContent
      content={text}
      sources={sources ?? NO_SOURCES}
      language={language}
      streaming={status.type === 'running'}
    />
  )
}

/** Running with no text yet: the backend is still retrieving and thinking. */
const isThinking = (s: AssistantState) =>
  s.message.status?.type === 'running' && !s.message.content.some(part => part.type === 'text' && part.text)

export function AssistantMessage() {
  const { strings: t } = useLocale()
  const canHover = useCanHover()
  return (
    <MessagePrimitive.Root className="flex gap-2 sm:gap-3 px-3 sm:px-6">
      <AssistantAvatar />
      <div className="min-w-0 max-w-[calc(100%-2.25rem)] sm:max-w-[80%] flex flex-col items-start">
        <AuiIf condition={isThinking}>
          <div className="bg-white rounded-2xl rounded-bl-md border border-border px-4 py-3 sm:px-5 sm:py-4 shadow-sm" role="status" aria-label={t.thinking}>
            <div className="flex gap-1.5" aria-hidden="true">
              <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="sr-only">{t.generating}</span>
          </div>
        </AuiIf>
        <AuiIf condition={s => !isThinking(s)}>
          <AssistantBubble>
            <MessagePrimitive.Parts components={{ Text: AnswerText }} />
          </AssistantBubble>
        </AuiIf>

        <div className="min-h-8 mt-1">
          <ActionBarPrimitive.Root hideWhenRunning autohide={canHover ? 'not-last' : 'never'} className="flex items-center gap-0.5 -ml-1">
            <ActionBarPrimitive.Copy className={ACTION_BUTTON} aria-label={t.copy} title={t.copy}>
              <Copy className="w-4 h-4 group-data-[copied=true]:hidden" strokeWidth={1.8} />
              <Check className="w-4 h-4 hidden group-data-[copied=true]:block" strokeWidth={2} />
            </ActionBarPrimitive.Copy>
            <ActionBarPrimitive.Reload className={ACTION_BUTTON} aria-label={t.regenerate} title={t.regenerate}>
              <RefreshCw className="w-4 h-4" strokeWidth={1.8} />
            </ActionBarPrimitive.Reload>
            <ActionBarPrimitive.FeedbackPositive className={ACTION_BUTTON} aria-label={t.helpful} title={t.helpful}>
              <ThumbsUp className="w-4 h-4 group-data-[submitted=true]:fill-primary/20" strokeWidth={1.8} />
            </ActionBarPrimitive.FeedbackPositive>
            <ActionBarPrimitive.FeedbackNegative className={ACTION_BUTTON} aria-label={t.notHelpful} title={t.notHelpful}>
              <ThumbsDown className="w-4 h-4 group-data-[submitted=true]:fill-primary/20" strokeWidth={1.8} />
            </ActionBarPrimitive.FeedbackNegative>
          </ActionBarPrimitive.Root>
        </div>
      </div>
    </MessagePrimitive.Root>
  )
}

const QuestionText: TextMessagePartComponent = ({ text }) => (
  <p className="text-sm text-white leading-relaxed whitespace-pre-wrap break-words">{text}</p>
)

export function UserMessage() {
  const { strings: t } = useLocale()
  const canHover = useCanHover()
  return (
    <MessagePrimitive.Root className="flex justify-end items-start gap-1 sm:gap-1.5 px-3 sm:px-6">
      <ActionBarPrimitive.Root hideWhenRunning autohide={canHover ? 'always' : 'never'} className="mt-1.5 shrink-0">
        <ActionBarPrimitive.Edit className={ACTION_BUTTON} aria-label={t.edit} title={t.edit}>
          <Pencil className="w-3.5 h-3.5" strokeWidth={1.8} />
        </ActionBarPrimitive.Edit>
      </ActionBarPrimitive.Root>
      <div className="min-w-0 max-w-[85%] sm:max-w-[75%] bg-user-bg rounded-2xl rounded-br-sm px-4 py-3 shadow-sm">
        <MessagePrimitive.Parts components={{ Text: QuestionText }} />
      </div>
    </MessagePrimitive.Root>
  )
}

/** Replaces a user message while it is being edited. */
export function EditComposer() {
  const { strings: t } = useLocale()
  return (
    <MessagePrimitive.Root className="flex justify-end px-3 sm:px-6">
      <ComposerPrimitive.Root className="w-full sm:max-w-[75%] bg-white rounded-2xl border border-primary/40 shadow-md">
        <ComposerPrimitive.Input
          autoFocus
          aria-label={t.edit}
          className="w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-sm pointer-coarse:text-base text-text-primary outline-none max-h-[188px]"
        />
        <div className="flex justify-end gap-1.5 px-2 pb-2">
          <ComposerPrimitive.Cancel className="px-3 py-1.5 pointer-coarse:py-2 rounded-lg text-xs font-medium text-text-secondary hover:bg-black/[0.04] transition-colors cursor-pointer">
            {t.cancel}
          </ComposerPrimitive.Cancel>
          <ComposerPrimitive.Send className="px-3 py-1.5 pointer-coarse:py-2 rounded-lg text-xs font-semibold bg-primary hover:bg-primary-dark text-white shadow-sm transition-colors cursor-pointer disabled:bg-black/[0.05] disabled:text-text-muted disabled:shadow-none disabled:cursor-not-allowed">
            {t.update}
          </ComposerPrimitive.Send>
        </div>
      </ComposerPrimitive.Root>
    </MessagePrimitive.Root>
  )
}
