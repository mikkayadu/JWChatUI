import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AUTO_LANGUAGE, fetchLanguages } from '../api/chat'
import type { LanguageInfo } from '../types'
import { UI_STRINGS, uiLanguageFor } from '../i18n/strings'
import type { Locale } from '../i18n/locale'

const STORAGE_KEY = 'jwchat.language'

// Backends that predate /api/languages answer in English only.
const ENGLISH_ONLY: LanguageInfo[] = [{ code: 'en', native_name: 'English', book_names: [] }]

function readStoredChoice(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || AUTO_LANGUAGE
  } catch {
    return AUTO_LANGUAGE
  }
}

/** The choice itself if the backend enables it, otherwise "auto". */
function validChoice(choice: string, languages: LanguageInfo[]): string {
  return choice === AUTO_LANGUAGE || languages.some(lang => lang.code === choice) ? choice : AUTO_LANGUAGE
}

/**
 * The answer-language picker: the enabled languages, the user's choice
 * (persisted), and the UI strings that follow it.
 *
 * `language` drives the picker and the UI. Until /api/languages answers it is
 * the stored choice, so a returning Twi user doesn't see an English flash.
 * `requestLanguage` is what to send with a question: it waits for the enabled
 * list, and `refresh` re-fetches it after the backend rejected a language.
 */
export function useLanguage() {
  const [languages, setLanguages] = useState<LanguageInfo[] | null>(null)
  const [choice, setChoice] = useState(readStoredChoice)
  // The current /api/languages request; null after a failure, so the next
  // question tries again (e.g. once a cold-starting backend is up).
  const languagesRequest = useRef<Promise<LanguageInfo[]> | null>(null)

  const loadLanguages = useCallback((): Promise<LanguageInfo[]> => {
    const request: Promise<LanguageInfo[]> = fetchLanguages().then(
      list => {
        setLanguages(list)
        return list
      },
      () => {
        if (languagesRequest.current === request) languagesRequest.current = null
        setLanguages(prev => prev ?? ENGLISH_ONLY)
        return ENGLISH_ONLY
      }
    )
    languagesRequest.current = request
    return request
  }, [])

  useEffect(() => {
    loadLanguages()
  }, [loadLanguages])

  const requestLanguage = useCallback(
    async (refresh = false): Promise<string> => {
      const request = (!refresh && languagesRequest.current) || loadLanguages()
      return validChoice(choice, await request)
    },
    [choice, loadLanguages]
  )

  const language = languages === null ? choice : validChoice(choice, languages)

  // "Auto" can't know the answer language in advance, so its UI is English.
  const uiLanguage = uiLanguageFor(language === AUTO_LANGUAGE ? 'en' : language)

  useEffect(() => {
    document.documentElement.lang = uiLanguage
  }, [uiLanguage])

  const setLanguage = useCallback((code: string) => {
    setChoice(code)
    try {
      localStorage.setItem(STORAGE_KEY, code)
    } catch {
      // Private mode or blocked storage: the choice just won't persist.
    }
  }, [])

  const locale = useMemo<Locale>(
    () => ({ uiLanguage, strings: UI_STRINGS[uiLanguage], languages: languages ?? ENGLISH_ONLY }),
    [uiLanguage, languages]
  )

  return { locale, language, setLanguage, requestLanguage }
}
