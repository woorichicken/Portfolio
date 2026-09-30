import type { Locale } from '@/i18n/config';
import ko from './ko';
import en from './en';
import es from './es';
import type { Content } from './types';

const CONTENT: Record<Locale, Content> = { ko, en, es };

export function getContent(locale: Locale): Content {
  return CONTENT[locale];
}
