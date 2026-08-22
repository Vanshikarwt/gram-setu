/**
 * useTranslation — GramSetu's lightweight i18n hook
 *
 * Usage:
 *   const { t, locale, lang } = useTranslation();
 *   t('nav.home')           // → "Home" | "होम" | "Home"
 *   t('status.pending')     // → "Pending" | "लंबित" | "Pending"
 *
 * No external library required. Reads from Zustand store.
 */
import { useStore } from '../store/useStore';
import { getLocale } from './index';
import type { Locale } from './types';

type NestedKeyOf<T> = T extends object
  ? { [K in keyof T]: K extends string
      ? T[K] extends object
        ? `${K}.${NestedKeyOf<T[K]>}`
        : K
      : never
    }[keyof T]
  : never;

export type TranslationKey = NestedKeyOf<Locale>;

function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return acc[key];
    }
    return path; // fallback: return the key itself
  }, obj);
}

export function useTranslation() {
  const language = useStore((state) => state.language);
  const locale = getLocale(language);

  const t = (key: TranslationKey): string => {
    const value = getNestedValue(locale, key);
    return typeof value === 'string' ? value : key;
  };

  return { t, locale, lang: language ?? 'hi' };
}
