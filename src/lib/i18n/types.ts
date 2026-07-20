import type dictionarySource from '@/locales/dictionary.json';

type LocaleLeaf = {uk: string; ru: string; en: string};

// Recursively replaces each { uk, ru, en } leaf with string.
// Type is inferred from dictionary.json directly — it doesn't depend on whether
// locales/generated/*.json files have been generated yet.
type Localized<T> = T extends LocaleLeaf
  ? string
  : T extends Record<string, unknown>
    ? {[K in keyof T]: Localized<T[K]>}
    : T;

export type Dictionary = Localized<typeof dictionarySource>;
