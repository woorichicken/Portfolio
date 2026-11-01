import Image from 'next/image';
import type { ReactNode } from 'react';
import { getContent } from '@/content';
import { screenCopy, type RoleId } from '@/content/roles';
import { LANGUAGE_NAMES, LOCALES, designPath, type Locale } from '@/i18n/config';
import FeedbackGate from '../feedback/FeedbackGate';
import Lightbox from '../Lightbox';
import { HeaderSolid, RoleChip, RoleHomeLink, TabBar, type TabKey } from './RoleClient';

// 리브랜딩 화면의 공통 뼈대 — 머리(로고 · 메뉴 · 언어 · 역할 아이콘) + 본문 + 연락 띠 + 모바일 아래 탭.
// altPath: 언어를 바꿀 때 같은 화면의 다른 언어판 주소. role: 지금 역할을 아는 화면(역할 화면)이면 넘긴다.

export default function Shell({ locale, altPath, role, tab, children, contact = true }: {
  locale: Locale;
  altPath: (l: Locale) => string;
  role?: RoleId;
  tab?: TabKey;
  children: ReactNode;
  /** 연락 띠를 보일지 — 어드민처럼 방문자용이 아닌 화면은 끈다 */
  contact?: boolean;
}) {
  const t = getContent(locale);
  const s = screenCopy(locale);
  return (
    <div className="has-tabbar">
      <a className="skip-link" href="#main">{t.a11y.skip}</a>
      <header className="sx-header">
        <div className="sx-header-inner">
          <RoleHomeLink locale={locale} className="wordmark" label={`SOLHUN — ${s.tabHome}`}>
            {/* 개인 브랜드 캐릭터(나무늘보) — brand 저장소의 승인된 프로필 컷 */}
            <Image src="/brand/solhun-sloth-96.png" alt="" width={28} height={28} />
            SOLHUN
          </RoleHomeLink>
          <nav aria-label={t.a11y.primaryNav} className="sx-nav">
            <RoleHomeLink locale={locale}>{s.tabHome}</RoleHomeLink>
            <a href={designPath(locale)} aria-current={tab === 'work' ? 'page' : undefined}>{s.tabWork}</a>
            <RoleHomeLink locale={locale} hash="#timeline">{t.timeline.title}</RoleHomeLink>
            <RoleHomeLink locale={locale} hash="#contact">{s.tabContact}</RoleHomeLink>
          </nav>
          <div className="sx-header-end">
            <nav aria-label={t.a11y.language} className="lang-switch">
              {LOCALES.map((l) => (
                <a key={l} href={altPath(l)} hrefLang={l} lang={l} aria-current={l === locale ? 'true' : undefined} title={LANGUAGE_NAMES[l]}>
                  <span aria-hidden="true">{l.toUpperCase()}</span>
                  <span className="visually-hidden">{LANGUAGE_NAMES[l]}</span>
                </a>
              ))}
            </nav>
            <RoleChip locale={locale} role={role} label={s.switchRole} />
          </div>
        </div>
      </header>
      <HeaderSolid />

      <main id="main">{children}</main>

      {contact && (
        <footer className="contact-band" id="contact" aria-labelledby="contact-title">
          <div className="wrap">
            <h2 id="contact-title" className="sec-title">{t.contact.title}</h2>
            <p className="contact-body">{t.contact.body}</p>
            <a className="contact-email" href={`mailto:${t.contact.email}`}>{t.contact.email}</a>
            <p className="contact-links">
              {t.contact.links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noreferrer">{l.label}</a>)}
            </p>
            <p className="footer-note">© 2026 {t.hero.name} · {t.footer.note}</p>
          </div>
        </footer>
      )}

      <TabBar
        locale={locale}
        role={role}
        current={tab}
        navLabel={t.a11y.primaryNav}
        workHref={designPath(locale)}
        labels={{ home: s.tabHome, work: s.tabWork, contact: s.tabContact, role: s.tabRole }}
      />
      <Lightbox closeLabel={t.a11y.closeImage} prevLabel={t.a11y.prevImage} nextLabel={t.a11y.nextImage} />
      <FeedbackGate copy={t.feedback} />
    </div>
  );
}
