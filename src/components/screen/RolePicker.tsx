import Image from 'next/image';
import { getContent } from '@/content';
import { PICKABLE_ROLES, ROLES, screenCopy } from '@/content/roles';
import { LANGUAGE_NAMES, LOCALES, browsePath, localePath, type Locale } from '@/i18n/config';
import EmailLink from '../EmailLink';
import FeedbackGate from '../feedback/FeedbackGate';
import Rich from '../Rich';
import { Avatar } from './icons';
import { PickerMemory } from './RoleClient';

// 첫 화면 — 「어떤 정경훈을 볼까요?」. 계정을 고르는 대신 보고 싶은 역할을 고른다(스탠드업 메모의 방향).
// 고르면 /as/<역할> 로 간다. 주소가 역할마다 달라서 「AX 쪽 저를 보세요」처럼 링크로 바로 보낼 수 있다.
// 아래 줄의 이름·소개는 처음 온 사람(과 검색엔진)이 이 사이트가 누구 것인지 알게 하려고 둔다.

export default function RolePicker({ locale }: { locale: Locale }) {
  const t = getContent(locale);
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
        <p className="picker-lead">{s.pickerLead}</p>
        <ul className="picker-grid">
          {PICKABLE_ROLES.map((role) => (
            <li key={role}>
              <a className="picker-tile" href={browsePath(locale, role)} data-pick-role={role}>
                <Avatar role={role} />
                <span className="picker-name">{ROLES[role].name[locale]}</span>
                <span className="picker-blurb">{ROLES[role].blurb[locale]}</span>
                <span className="picker-recent">{s.pickerRecent}</span>
              </a>
            </li>
          ))}
        </ul>
        <div>
          <a className="picker-all" href={browsePath(locale, 'all')} data-pick-role="all">{s.pickerAll}</a>
        </div>
      </main>

      <footer className="picker-about">
        <div className="picker-about-inner">
          <p><b>{t.hero.name} (SOLHUN)</b> · {t.hero.role}</p>
          <p><Rich text={t.hero.lead} /></p>
          <p className="picker-links">
            {t.hero.links.map((l) =>
              l.href.startsWith('mailto:') ? (
                <EmailLink key={l.href} href={l.href} label={l.label} copiedLabel={t.a11y.copied} />
              ) : (
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer">{l.label}</a>
              ),
            )}
          </p>
        </div>
      </footer>
      <PickerMemory />
      <FeedbackGate copy={t.feedback} />
    </div>
  );
}
