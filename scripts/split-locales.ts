import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {resolve} from 'node:path';

const SOURCE_PATH = resolve(process.cwd(), 'locales/dictionary.json');
const OUTPUT_DIR = resolve(process.cwd(), 'locales/generated');
const LOCALES = ['uk', 'ru', 'en'] as const;
type Locale = (typeof LOCALES)[number];

type LocaleLeaf = Record<Locale, string>;
type DictionaryNode = LocaleLeaf | {[key: string]: DictionaryNode};

function isLeaf(node: unknown): node is LocaleLeaf {
  if (typeof node !== 'object' || node === null || Array.isArray(node)) {
    return false;
  }
  const keys = Object.keys(node);
  return LOCALES.every(locale => keys.includes(locale));
}

function splitByLocale(node: DictionaryNode, locale: Locale, path: string[]): unknown {
  if (isLeaf(node)) {
    const value = node[locale];
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error(`[split-locales] Empty or missing translation for "${locale}" at key: ${path.join('.')}`);
    }
    return value;
  }

  if (typeof node === 'object' && node !== null) {
    return Object.fromEntries(
      Object.entries(node).map(([key, value]) => [key, splitByLocale(value as DictionaryNode, locale, [...path, key])])
    );
  }

  throw new Error(`[split-locales] Unexpected value at key: ${path.join('.')} (expected object { uk, ru, en })`);
}

function main() {
  const raw = readFileSync(SOURCE_PATH, 'utf-8');
  const dictionary = JSON.parse(raw) as DictionaryNode;

  mkdirSync(OUTPUT_DIR, {recursive: true});

  for (const locale of LOCALES) {
    const localized = splitByLocale(dictionary, locale, []);
    writeFileSync(resolve(OUTPUT_DIR, `${locale}.json`), JSON.stringify(localized, null, 2) + '\n', 'utf-8');
    console.log(`[split-locales] ✓ locales/generated/${locale}.json`);
  }
}

main();
