import { createContext, useContext } from 'react'
import type { LanguageInfo } from '../types'
import { UI_STRINGS, type UiLanguage, type UiStrings } from './strings'

export interface Locale {
  uiLanguage: UiLanguage
  strings: UiStrings
  /** Enabled answer languages; just English until /api/languages answers. */
  languages: LanguageInfo[]
}

export const LocaleContext = createContext<Locale>({
  uiLanguage: 'en',
  strings: UI_STRINGS.en,
  languages: [],
})

export function useLocale(): Locale {
  return useContext(LocaleContext)
}

/** Bible book names for an answer language, or none if it isn't enabled.
 * None for English too: the scripture parser's built-in English index
 * already has its names plus the abbreviations ("Ps.", "Jn") answers use. */
export function bookNamesFor(languages: LanguageInfo[], code: string | undefined): readonly string[] {
  if (code === 'en') return []
  return languages.find(lang => lang.code === code)?.book_names ?? []
}
