/**
 * GramSetu Locale Registry
 * Register all supported languages here.
 * To add a new language: import it and add to LOCALES map.
 */
import { en } from './en';
import { hi } from './hi';
import { hinglish } from './hinglish';
import type { Locale } from './types';

export type LangCode = 'en' | 'hi' | 'hinglish';

export const LOCALES: Record<LangCode, Locale> = {
  en,
  hi,
  hinglish,
};

/** Resolve a language code to its locale, defaulting to Hindi. */
export function getLocale(code: string | null | undefined): Locale {
  if (code && code in LOCALES) {
    return LOCALES[code as LangCode];
  }
  return LOCALES.hi;
}

export type { Locale };
