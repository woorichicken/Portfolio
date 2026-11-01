import Image from 'next/image';
import { getContent } from '@/content';
import { ROLES, screenCopy, type RoleId } from '@/content/roles';
import { roleScreen } from '@/content/screen-data';
import { browsePath, designPath, projectPath, type Locale } from '@/i18n/config';
import { ArtifactTileCard, Row, TitleCard } from './Cards';
import { Avatar, IconExternal, IconInfo } from './icons';
import { RememberRole } from './RoleClient';
import Shell from './Shell';

// 역할 화면(/as/<역할>) — 대표작 빌보드 → 가로 행들(그 역할의 프로젝트 · 숫자 · 결과물 · 그 외 · 이전) → 연표 → 연락.
// 어떤 프로젝트를 몇 번째에 둘지는 content/roles.ts 가 정한다. 여기는 그 순서를 그리기만 한다.

export default function Browse({ locale, role }: { locale: Locale; role: RoleId }) {
  const t = getContent(locale);
  const s = screenCopy(locale);
  const def = ROLES[role];
  const data = roleScreen(locale, role);
  const f = data.featured;
  const site = f.links?.[0];
  const arrows = { prevLabel: s.prevRow, nextLabel: s.nextRow };

  return (
    <Shell locale={locale} altPath={(l) => browsePath(l, role)} role={role} tab="home">
      <RememberRole role={role} />

      {/* 빌보드 — 넷플릭스 2026 홈처럼 바깥 여백 안에 들어간 둥근 카드. 큰 화면은 가로(2.18:1), 작은 화면은 세로 카드 */}
      <section className="billboard" aria-labelledby="billboard-title">
        <div className="billboard-media">
          <Image src={f.cover.src} alt="" width={f.cover.width} height={f.cover.height} sizes="(max-width: 1000px) 100vw, 1400px" priority />
        </div>
        <div className="billboard-body">
          <p className="billboard-kicker"><Avatar role={role} />{t.hero.name} · {def.name[locale]} · {s.featured}</p>
          <h1 className="billboard-title" id="billboard-title">{f.name}</h1>
          <ul className="dot-list billboard-meta">
            {f.facts.slice(0, 2).map((fact) => <li key={fact.label}>{fact.value}</li>)}
            <li>{f.context}</li>
          </ul>
          <p className="billboard-synopsis">{f.tagline}</p>
          <div className="billboard-actions">
            <a className="btn btn-primary btn-lg" href={projectPath(locale, f.id)}><IconInfo />{s.moreInfo}</a>
            {site && <a className="btn btn-ghost btn-lg" href={site.href} target="_blank" rel="noreferrer"><IconExternal />{s.openSite}<span className="visually-hidden"> {s.newTab}</span></a>}
          </div>
        </div>
        {/* 넷플릭스의 「에미상 수상작」 자리 — 우리는 그 프로젝트의 숫자 근거 두 개 */}
        {f.metrics && f.metrics.length > 0 && (
          <ul className="billboard-callouts">
            {f.metrics.slice(0, 2).map((m) => <li key={m.label}><b>{m.value}</b><span>{m.label}</span></li>)}
          </ul>
        )}
      </section>

      <div className="rows">
        <Row id="row-projects" title={def.rowTitle[locale]} size="lg" {...arrows}>
          {data.projects.map((c) => (
            <li key={c.slug}><TitleCard card={c} locale={locale} sizes="(max-width: 499px) 50vw, (max-width: 1099px) 30vw, 20vw" /></li>
          ))}
        </Row>

        <Row id="row-stats" title={t.stats.title} size="md" {...arrows}>
          {t.stats.items.map((m) => (
            <li key={m.label}><p className="stat"><strong>{m.value}</strong><span>{m.label}</span></p></li>
          ))}
        </Row>

        {data.artifacts.length > 0 && (
          <Row id="row-artifacts" title={s.artifactsRow} size="md" more={{ href: designPath(locale), label: s.seeAll }} {...arrows}>
            {data.artifacts.map((item) => (
              <li key={`${item.projectSlug ?? ''}-${item.artifact.title}`} {...('example' in item.artifact ? { 'data-example': '' } : {})}>
                <ArtifactTileCard item={item} sizes="(max-width: 499px) 50vw, (max-width: 1099px) 30vw, 20vw" exampleLabel={t.design.example} openLabel={t.a11y.openImage} />
              </li>
            ))}
          </Row>
        )}

        {data.others.length > 0 && (
          <Row id="row-others" title={t.others.title} size="sm" {...arrows}>
            {data.others.map((c) => (
              <li key={c.slug}><TitleCard card={c} locale={locale} sizes="(max-width: 499px) 50vw, (max-width: 1099px) 30vw, 20vw" /></li>
            ))}
          </Row>
        )}

        {data.early.length > 0 && (
          <Row id="row-early" title={t.early.title} size="sm" {...arrows}>
            {data.early.map((c) => (
              <li key={c.slug}><TitleCard card={c} locale={locale} sizes="(max-width: 499px) 50vw, (max-width: 1099px) 30vw, 20vw" /></li>
            ))}
          </Row>
        )}
      </div>

      <section className="sec" id="timeline" aria-labelledby="timeline-title">
        <div className="wrap">
          <h2 className="sec-title" id="timeline-title">{t.timeline.title}</h2>
          <ol className="timeline">
            {t.timeline.items.slice().reverse().map((item) => (
              <li key={item.date}><time>{item.date}</time><p>{item.text}</p></li>
            ))}
          </ol>
        </div>
      </section>
    </Shell>
  );
}
