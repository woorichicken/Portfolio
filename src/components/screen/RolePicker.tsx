import Image from 'next/image';
import { getContent } from '@/content';
import { PICKABLE_ROLES, screenCopy } from '@/content/roles';
import type { SiteDocs } from '@/content/schema';
import { LANGUAGE_NAMES, LOCALES, browsePath, localePath, type Locale } from '@/i18n/config';
import EmailLink from '../EmailLink';
import FeedbackGate from '../feedback/FeedbackGate';
import Rich from '../Rich';
import AboutDialog from './AboutDialog';
import { Avatar } from './icons';
import { PickerMemory } from './RoleClient';

// 첫 화면 — 「어떤 정경훈을 볼까요?」. 계정을 고르는 대신 보고 싶은 역할을 고른다(스탠드업 메모의 방향).
// 고르면 /as/<역할> 로 간다. 주소가 역할마다 달라서 「AX 쪽 저를 보세요」처럼 링크로 바로 보낼 수 있다.
// 5회차 리뷰(D1): 첫 화면은 제목 · 역할 이름 · 두 단추만. 누구 사이트인지(U01)는 제목의 이름과 「정경훈 소개」 창이 맡는다.

export default function RolePicker({ site, locale }: { site: SiteDocs; locale: Locale }) {
  const t = getContent(site, locale);
  const s = screenCopy(locale);
  return (
    <div className="picker">
      <div className="picker-top">
        <a className="wordmark" href={localePath(locale)}>
          <Image src="/brand/solhun-sloth-96.png" alt="" width={28} height={28} priority />
          SOLHUN
        </a>
        <nav aria-label={t.a11y.language} className="lang-switch">
          {LOCALES.map((l) => (
            <a key={l} href={localePath(l)} hrefLang={l} lang={l} aria-current={l === locale ? 'true' : undefined} title={LANGUAGE_NAMES[l]}>
              <span aria-hidden="true">{l.toUpperCase()}</span>
              <span className="visually-hidden">{LANGUAGE_NAMES[l]}</span>
            </a>
          ))}
        </nav>
      </div>

      <main id="main" className="picker-main">
        <h1 className="picker-title">{s.pickerTitle}</h1>
        <ul className="picker-grid">
          {PICKABLE_ROLES.map((role) => (
            <li key={role}>
              <a className="picker-tile" href={browsePath(locale, role)} data-pick-role={role}>
                <Avatar role={role} />
                <span className="picker-name">{site.roles[role].name[locale]}</span>
                <span className="picker-recent">{s.pickerRecent}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="picker-actions">
          <a className="btn btn-outline picker-all" href={browsePath(locale, 'all')} data-pick-role="all">{s.pickerAll}</a>
          <AboutDialog label={s.aboutMe} closeLabel={s.close} titleId="about-title">
            <div className="about-head">
              <Image src="/brand/solhun-sloth-96.png" alt="" width={56} height={56} />
              <div>
                <h2 id="about-title" className="about-name">{t.hero.name} <span>SOLHUN</span></h2>
                <p className="about-role">{t.hero.role}</p>
              </div>
            </div>
            <p className="about-lead"><Rich text={t.hero.lead} /></p>
            <ul className="about-points">
              {t.hero.keywords.map((k) => <li key={k.title}><b>{k.title}</b><span>{k.body}</span></li>)}
            </ul>
            <p className="about-links">
              {t.hero.links.map((l) =>
                l.href.startsWith('mailto:') ? (
                  <EmailLink key={l.href} href={l.href} label={l.label} copiedLabel={t.a11y.copied} />
                ) : (
                  <a key={l.href} href={l.href} target="_blank" rel="noreferrer">{l.label}</a>
                ),
              )}
            </p>
          </AboutDialog>
        </div>
      </main>

      <PickerMemory />
      <FeedbackGate copy={t.feedback} />
    </div>
  );
}
