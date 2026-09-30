import type { Content } from '@/content/types';
import { LANGUAGE_NAMES, LOCALES, localePath, type Locale } from '@/i18n/config';

// 언어 전환은 페이지 전체를 다른 주소로 옮기는 링크다. 언어별 루트 레이아웃이 달라 SPA 전환이 아니어도 된다.
export default function Header({ locale, t }: { locale: Locale; t: Content }) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a className="wordmark" href={localePath(locale)}>SOLHUN</a>
        <nav aria-label={t.a11y.primaryNav} className="site-nav">
          <a href="#work">{t.nav.work}</a>
          <a href="#process">{t.nav.process}</a>
          <a href="#timeline">{t.nav.timeline}</a>
          <a href="#contact">{t.nav.contact}</a>
        </nav>
        <nav aria-label={t.a11y.language} className="lang-switch">
          {LOCALES.map((l) => (
            <a
              key={l}
              href={localePath(l)}
              hrefLang={l}
              lang={l}
              aria-current={l === locale ? 'true' : undefined}
              title={LANGUAGE_NAMES[l]}
            >
              <span aria-hidden="true">{l.toUpperCase()}</span>
              <span className="visually-hidden">{LANGUAGE_NAMES[l]}</span>
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
