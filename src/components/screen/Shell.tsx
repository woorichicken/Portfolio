import Image from 'next/image';
import type { ReactNode } from 'react';
import { getContent } from '@/content';
import { roleNames, screenCopy, type RoleId } from '@/content/roles';
import type { SiteDocs } from '@/content/schema';
import { LANGUAGE_NAMES, LOCALES, type Locale } from '@/i18n/config';
import FeedbackGate from '../feedback/FeedbackGate';
import Lightbox from '../Lightbox';
import { IconMail } from './icons';
import { CarryHash, HeaderSolid, MenuButton, RoleChip, RoleHomeLink, type TabKey } from './RoleClient';

// 리브랜딩 화면의 공통 뼈대 — 머리(로고 · 메뉴 · 언어 · 역할 아이콘) + 본문 + 연락 띠.
// 좁은 화면은 메뉴·언어를 「메뉴 ▾」 하나로 접는다(넷플릭스 웹 390px 과 같은 방식). 아래 탭 막대는 3회차에 뺐다.
// altPath: 언어를 바꿀 때 같은 화면의 다른 언어판 주소. role: 지금 역할을 아는 화면(역할 화면)이면 넘긴다.

export default function Shell({ site, locale, altPath, role, tab, children, contact = true }: {
  site: SiteDocs;
  locale: Locale;
  altPath: (l: Locale) => string;
  role?: RoleId;
  tab?: TabKey;
  children: ReactNode;
  /** 연락 띠를 보일지 — 어드민처럼 방문자용이 아닌 화면은 끈다 */
  contact?: boolean;
}) {
  const t = getContent(site, locale);
  const s = screenCopy(locale);
  // 머리 메뉴와 좁은 화면의 「메뉴 ▾」 안이 같은 링크를 쓴다
  const navLinks = (
    <>
      <RoleHomeLink locale={locale} role={role} current={tab === 'home'} spy={tab === 'home'}>{s.tabHome}</RoleHomeLink>
      <RoleHomeLink locale={locale} role={role} hash="#timeline" spy={tab === 'home'}>{t.timeline.title}</RoleHomeLink>
      <RoleHomeLink locale={locale} role={role} hash="#contact" spy={tab === 'home'}>{s.tabContact}</RoleHomeLink>
    </>
  );
  const langLinks = LOCALES.map((l) => (
    <a key={l} href={altPath(l)} hrefLang={l} lang={l} aria-current={l === locale ? 'true' : undefined} title={LANGUAGE_NAMES[l]}>
      <span aria-hidden="true">{l.toUpperCase()}</span>
      <span className="visually-hidden">{LANGUAGE_NAMES[l]}</span>
    </a>
  ));
  return (
    <div className="screen">
      <a className="skip-link" href="#main">{t.a11y.skip}</a>
      <header className="sx-header">
        <div className="sx-header-inner">
          <RoleHomeLink locale={locale} role={role} className="wordmark" label={`SOLHUN — ${s.tabHome}`}>
            {/* 개인 브랜드 캐릭터(나무늘보) — brand 저장소의 승인된 프로필 컷 */}
            <Image src="/brand/solhun-sloth-96.png" alt="" width={28} height={28} />
            SOLHUN
          </RoleHomeLink>
          <nav aria-label={t.a11y.primaryNav} className="sx-nav">{navLinks}</nav>
          <MenuButton label={s.menu}>
            <nav aria-label={t.a11y.primaryNav} className="sx-menu-nav">{navLinks}</nav>
            <nav aria-label={t.a11y.language} className="lang-switch sx-menu-lang">{langLinks}</nav>
          </MenuButton>
          <div className="sx-header-end">
            <nav aria-label={t.a11y.language} className="lang-switch">{langLinks}</nav>
            <RoleChip locale={locale} role={role} label={s.switchRole} names={roleNames(site.roles, locale)} />
          </div>
        </div>
      </header>
      <HeaderSolid />
      <CarryHash />

      <main id="main">{children}</main>

      {contact && (
        <footer className="contact-band" id="contact" aria-labelledby="contact-title">
          {/* 넷플릭스에는 없는 칸 — 포트폴리오의 끝은 「연락」이라 빌보드와 같은 둥근 카드로 한 번 더 세운다 */}
          <div className="contact-card" data-role={role ?? 'all'}>
            <h2 id="contact-title" className="contact-title">{t.contact.title}</h2>
            <p className="contact-body">{t.contact.body}</p>
            <div className="contact-actions">
              <a className="btn btn-primary btn-lg" href={`mailto:${t.contact.email}`}><IconMail />{s.emailMe}</a>
              {t.contact.links.map((l) => <a key={l.href} className="btn btn-ghost btn-lg" href={l.href} target="_blank" rel="noreferrer">{l.label}<span className="visually-hidden"> {s.newTab}</span></a>)}
            </div>
            <p className="contact-email-line"><a href={`mailto:${t.contact.email}`}>{t.contact.email}</a></p>
          </div>
          <p className="footer-note">© 2026 {t.hero.name} · {t.footer.note}</p>
        </footer>
      )}

      <Lightbox closeLabel={t.a11y.closeImage} prevLabel={t.a11y.prevImage} nextLabel={t.a11y.nextImage} originalLabel={s.openOriginal} />
      <FeedbackGate copy={t.feedback} />
    </div>
  );
}
