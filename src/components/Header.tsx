import Image from 'next/image';
import type { Content } from '@/content/types';
import { LANGUAGE_NAMES, LOCALES, localePath, projectPath, type Locale } from '@/i18n/config';

// 언어 전환은 페이지 전체를 다른 주소로 옮기는 링크다. 언어별 루트 레이아웃이 달라 SPA 전환이 아니어도 된다.
// detailSlug 가 있으면 상세 페이지다 — 메뉴는 홈의 해당 위치로, 언어 전환은 같은 프로젝트의 다른 언어판으로 간다.
export default function Header({ locale, t, detailSlug }: { locale: Locale; t: Content; detailSlug?: string }) {
  const home = detailSlug ? localePath(locale) : '';
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a className="wordmark" href={localePath(locale)}>
          {/* 개인 브랜드 캐릭터(나무늘보) — brand 저장소의 승인된 프로필 컷 */}
          <Image src="/brand/solhun-sloth-96.png" alt="" width={28} height={28} />
          SOLHUN
        </a>
        <nav aria-label={t.a11y.primaryNav} className="site-nav">
          <a href={`${home}#work`}>{t.nav.work}</a>
          <a href={`${home}#timeline`}>{t.nav.timeline}</a>
          <a href={`${home}#contact`}>{t.nav.contact}</a>
        </nav>
        <nav aria-label={t.a11y.language} className="lang-switch">
          {LOCALES.map((l) => (
            <a
              key={l}
              href={detailSlug ? projectPath(l, detailSlug) : localePath(l)}
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
