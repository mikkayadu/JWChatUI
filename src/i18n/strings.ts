import type { ThinkingMode } from '../api/chat'
import type { SourceKind } from '../utils/jwUrl'

export interface UiStrings {
  tagline: string
  welcome: string
  newStudy: string
  nav: { library: string; saved: string }
  recentChats: string
  newChatTitle: string
  deleteChat: string
  viewResources: string
  settings: string
  help: string
  openSidebar: string
  closeSidebar: string
  mainNavigation: string
  references: string
  openReferences: string
  closeReferences: string
  referencesEmpty: string
  chatMessages: string
  thinking: string
  generating: string
  suggestions: string[]
  scrollToBottom: string
  inputPlaceholder: string
  inputLabel: string
  send: string
  stop: string
  citations: string
  modes: Record<ThinkingMode, { label: string; description: string }>
  answerLanguage: string
  autoLanguage: string
  autoLanguageDescription: string
  sources: string
  sourceNumber: (n: number) => string
  sourceTypes: Record<SourceKind, string>
  sourceSections: { books: string; magazines: string; videos: string }
  bibleTeaching: string
  scripture: (reference: string) => string
  closeScripture: string
  loadingVerse: string
  verseError: string
  openOnJwOrg: string
  errorGeneric: string
  noResponse: string
  copy: string
  regenerate: string
  edit: string
  cancel: string
  update: string
  helpful: string
  notHelpful: string
}

const en: UiStrings = {
  tagline: 'Deep Spiritual Research',
  welcome:
    'Welcome to your study session. I am here to assist you with biblical research. How may I help you explore the Scriptures today?',
  newStudy: 'New Study',
  nav: { library: 'Library', saved: 'Saved Insights' },
  recentChats: 'Recent History',
  newChatTitle: 'New study',
  deleteChat: 'Delete conversation',
  viewResources: 'View Resources',
  settings: 'Settings',
  help: 'Help',
  openSidebar: 'Open sidebar',
  closeSidebar: 'Close sidebar',
  mainNavigation: 'Main navigation',
  references: 'References',
  openReferences: 'Open references',
  closeReferences: 'Close references',
  referencesEmpty: 'Source references will appear here when you ask a question.',
  chatMessages: 'Chat messages',
  thinking: 'Thinking',
  generating: 'Generating response...',
  suggestions: [
    "What does the Bible say about God's Kingdom?",
    'Why does God allow suffering?',
    'What happens to us when we die?',
    'How can I make my prayers more meaningful?',
  ],
  scrollToBottom: 'Scroll to latest message',
  inputPlaceholder: 'Ask a question about Bible teachings...',
  inputLabel: 'Message input',
  send: 'Send message',
  stop: 'Stop generating',
  citations: 'Citations',
  modes: {
    normal: { label: 'Normal', description: 'Fast response' },
    thinking: { label: 'Thinking', description: 'Deeper analysis' },
    advanced: { label: 'Advanced', description: 'Multi-strategy' },
  },
  answerLanguage: 'Answer language',
  autoLanguage: 'Auto',
  autoLanguageDescription: "Answer in the question's language",
  sources: 'Sources',
  sourceNumber: n => `Source ${n}`,
  sourceTypes: {
    book: 'Book',
    magazine: 'Magazine',
    video: 'Video',
    teaching: 'Article',
    article: 'Article',
    source: 'Source',
  },
  sourceSections: { books: 'Books', magazines: 'Magazines', videos: 'Videos' },
  bibleTeaching: 'Bible Teaching',
  scripture: reference => `Scripture: ${reference}`,
  closeScripture: 'Close scripture popup',
  loadingVerse: 'Loading verse…',
  verseError: "Couldn't load the verse text right now.",
  openOnJwOrg: 'Open on JW.org',
  errorGeneric:
    'I apologize, but I encountered an error processing your request. Please try again.',
  noResponse: 'I could not generate a response.',
  copy: 'Copy',
  regenerate: 'Regenerate answer',
  edit: 'Edit question',
  cancel: 'Cancel',
  update: 'Update',
  helpful: 'Helpful',
  notHelpful: 'Not helpful',
}

// DRAFT: machine-drafted Twi that must be reviewed by a fluent Twi speaker
// before Twi is enabled in production. Section names follow jw.org/tw.
const tw: UiStrings = {
  tagline: 'Honhom Fam Nhwehwɛmu',
  welcome:
    "Akwaaba wɔ w'adesua mu. Mewɔ ha sɛ mɛboa wo wɔ Bible mu nhwehwɛmu. Ɔkwan bɛn so na metumi aboa wo ma woahwehwɛ Kyerɛwnsɛm no mu nnɛ?",
  newStudy: 'Adesua Foforo',
  nav: { library: 'Nhomakorabea', saved: 'Nsɛm a Woakora' },
  recentChats: 'Nkɔmmɔ a Atwam',
  newChatTitle: 'Adesua foforo',
  deleteChat: 'Yi nkɔmmɔ no fi hɔ',
  viewResources: 'Hwɛ Nneɛma a Ɛboa',
  settings: 'Nhyehyɛe',
  help: 'Mmoa',
  openSidebar: 'Bue akwankyerɛ',
  closeSidebar: 'To akwankyerɛ mu',
  mainNavigation: 'Akwankyerɛ titiriw',
  references: 'Nsɛm Fibea',
  openReferences: 'Bue nsɛm fibea',
  closeReferences: 'To nsɛm fibea mu',
  referencesEmpty: 'Sɛ wobisa asɛm a, nsɛm fibea bɛda adi wɔ ha.',
  chatMessages: 'Nkɔmmɔ no mu nsɛm',
  thinking: 'Ɛredwene',
  generating: 'Yɛreyɛ mmuae no...',
  suggestions: [
    'Dɛn na Bible ka fa Onyankopɔn Ahenni no ho?',
    'Dɛn nti na Onyankopɔn ma amanehunu kwan?',
    'Dɛn na ɛto yɛn sɛ yewu a?',
    'Mɛyɛ dɛn atumi abɔ mpae a ɛfi me koma mu?',
  ],
  scrollToBottom: 'Kɔ asɛm a etwa to no so',
  inputPlaceholder: 'Bisa asɛm bi a ɛfa Bible nkyerɛkyerɛ ho...',
  inputLabel: "Kyerɛw w'asɛm",
  send: 'Soma',
  stop: 'Gyae',
  citations: 'Fibea',
  modes: {
    normal: { label: 'Ntɛm', description: 'Mmuae ntɛmntɛm' },
    thinking: { label: 'Dwene Mu', description: 'Nhwehwɛmu a emu dɔ' },
    advanced: { label: 'Akwan Pii', description: 'Akwan ahorow pii' },
  },
  answerLanguage: 'Mmuae kasa',
  autoLanguage: 'Auto',
  autoLanguageDescription: 'Kasa a wode bisaa asɛm no',
  sources: 'Nsɛm Fibea',
  sourceNumber: n => `Fibea ${n}`,
  sourceTypes: {
    book: 'Nhoma',
    magazine: 'Nsɛmma Nhoma',
    video: 'Video',
    teaching: 'Asɛm',
    article: 'Asɛm',
    source: 'Fibea',
  },
  sourceSections: { books: 'Nhoma', magazines: 'Nsɛmma Nhoma', videos: 'Video' },
  bibleTeaching: 'Bible Nkyerɛkyerɛ',
  scripture: reference => `Kyerɛwsɛm: ${reference}`,
  closeScripture: 'To kyerɛwsɛm no mu',
  loadingVerse: 'Ɛreba…',
  verseError: 'Yɛantumi amfa nkyerɛwee no amma seesei.',
  openOnJwOrg: 'Bue wɔ JW.ORG so',
  errorGeneric:
    "Yɛpa wo kyɛw, biribi asɛe enti mantumi annyi w'asɛmmisa no ano. Yɛsrɛ wo, san bɔ mmɔden.",
  noResponse: 'Mantumi amma mmuae biara.',
  copy: 'Fa yɛ bi',
  regenerate: 'San yɛ mmuae no',
  edit: 'Sesa asɛmmisa no',
  cancel: 'Gyae',
  update: 'Soma bio',
  helpful: 'Ɛboa',
  notHelpful: 'Ɛmmoa',
}

export const UI_STRINGS = { en, tw }

export type UiLanguage = keyof typeof UI_STRINGS

/** The UI language for an answer language: itself when the UI has strings
 * for it, otherwise English. */
export function uiLanguageFor(code: string): UiLanguage {
  return Object.hasOwn(UI_STRINGS, code) ? (code as UiLanguage) : 'en'
}
