import { createContext, useContext, useEffect, useState } from 'react'
import { initialLang, STRINGS, type Lang, type Strings } from './i18n'

const STORAGE_KEY = 'rdr2-domino-lang'

export function useLangState() {
  const [lang, setLang] = useState<Lang>(() =>
    initialLang(localStorage.getItem(STORAGE_KEY), navigator.language),
  )
  const t = STRINGS[lang]

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = t.htmlLang
    document.title = t.pageTitle
  }, [lang, t])

  return { lang, setLang, t }
}

export const LangContext = createContext<Strings>(STRINGS.pt)
export const useT = () => useContext(LangContext)
