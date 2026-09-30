// 언어 설정 한 곳. 한국어는 루트(/), 나머지는 /en · /es 아래에 둔다.
// 한국어를 /ko 로 보내지 않는 이유: 기존 주소(/)가 한국어였고, 대표 언어의 주소를 짧게 유지하기 위해서다.

export const LOCALES = ['ko', 'en', 'es'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'ko';

/** 번역된 하위 경로를 가진 언어(= /[locale] 라우트가 만드는 언어) */
export const PREFIXED_LOCALES = LOCALES.filter((l) => l !== DEFAULT_LOCALE) as Exclude<Locale, 'ko'>[];

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function localePath(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? '/' : `/${locale}`;
}

// canonical·hreflang 의 절대 주소 기준. 도메인이 아직 확정 전이라 env 로 바꿀 수 있게 둔다(docs/DEPLOY.md).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://solhun.com').replace(/\/$/, '');

export const LANGUAGE_NAMES: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
  es: 'Español',
};

export const OG_LOCALES: Record<Locale, string> = {
  ko: 'ko_KR',
  en: 'en_US',
  es: 'es_ES',
};
