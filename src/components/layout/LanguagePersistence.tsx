'use client';

import React, { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setLanguage, Language } from '@/redux/features/ui/uiSlice';

const STORAGE_KEY = 'apni_padhai_language';

export const LanguagePersistence: React.FC = () => {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.ui.language);
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'hi') {
        dispatch(setLanguage(saved as Language));
      }
    } catch (e) {
      console.error('Failed to load language from storage', e);
    }
    hydrated.current = true;
  }, [dispatch]);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch (e) {
      console.error('Failed to save language to storage', e);
    }
  }, [language]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return null;
};
