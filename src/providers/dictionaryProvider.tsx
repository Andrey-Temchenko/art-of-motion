'use client';

import type {ReactNode} from 'react';
import React, {createContext, useContext, useState} from 'react';

import {createStore, useStore} from 'zustand';

import type {getDictionary} from '@/lib/i18n/getDictionary';

type Dictionary = Awaited<ReturnType<typeof getDictionary>>;

interface DictionaryState {
  dict: Dictionary;
}

type DictionaryStore = ReturnType<typeof createDictionaryStore>;

const createDictionaryStore = (dict: Dictionary) => {
  return createStore<DictionaryState>()(() => ({
    dict
  }));
};

export const DictionaryContext = createContext<DictionaryStore | null>(null);

export function DictionaryProvider({children, dict}: {children: ReactNode; dict: Dictionary}) {
  const [store] = useState(() => createDictionaryStore(dict));

  return <DictionaryContext.Provider value={store}>{children}</DictionaryContext.Provider>;
}

export function useDictionary(): Dictionary {
  const store = useContext(DictionaryContext);
  if (!store) {
    throw new Error('useDictionary must be used within a DictionaryProvider');
  }
  return useStore(store, state => state.dict);
}
