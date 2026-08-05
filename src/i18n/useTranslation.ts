'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setLanguage, type Language } from '@/redux/features/ui/uiSlice';
import { UI_DICTIONARY } from './index';

export function useTranslation() {
  const language = useAppSelector((state) => state.ui.language);
  const dispatch = useAppDispatch();

  const t = useCallback(
    (key: string, ...args: (string | number)[]): string => {
      let text = language === 'en' ? key : (UI_DICTIONARY[key] ?? key);
      args.forEach((arg, idx) => {
        text = text.replace(new RegExp(`\\{${idx}\\}`, 'g'), String(arg));
      });
      return text;
    },
    [language],
  );

  const changeLanguage = useCallback(
    (lang: Language) => {
      dispatch(setLanguage(lang));
    },
    [dispatch],
  );

  return { t, language, changeLanguage, isHindi: language === 'hi' };
}
