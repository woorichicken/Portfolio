import Image from 'next/image';
import { getContent } from '@/content';
import { ROLES, screenCopy, type RoleId } from '@/content/roles';
import { roleScreen } from '@/content/screen-data';
import { browsePath, designPath, projectPath, type Locale } from '@/i18n/config';
import { ArtifactTileCard, Row, TitleCard } from './Cards';
import { IconExternal, IconInfo } from './icons';
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

      <section className="billboard" aria-labelledby="billboard-title">
        <div className="billboard-media">
          <Image src={f.cover.src} alt="" width={f.cover.width} height={f.cover.height} sizes="100vw" priority />
        </div>
        <div className="billboard-body">
          <div className="billboard-copy">
            <p className="billboard-kicker">{s.featured} · {def.name[locale]}</p>
            <h1 className="billboard-title" id="billboard-title">{f.name}</h1>
            <p className="billboard-tagline">{f.tagline}</p>
            <ul className="billboard-meta">
              {f.facts.slice(0, 2).map((fact) => <li key={fact.label}>{fact.value}</li>)}
              <li>{f.context}</li>
            </ul>
            <div className="billboard-actions">
              <a className="btn btn-primary" href={projectPath(locale, f.id)}><IconInfo />{s.moreInfo}</a>
              {site && <a className="btn btn-ghost" href={site.href} target="_blank" rel="noreferrer"><IconExternal />{s.openSite}</a>}
            </div>
          </div>
        </div>
      </section>

      <div className="rows">
        <Row id="row-projects" title={def.rowTitle[locale]} size="lg" {...arrows}>
          {data.projects.map((c, i) => (
            <li key={c.slug}><TitleCard card={c} locale={locale} sizes="(max-width: 760px) 78vw, 30vw" priority={i < 2} /></li>
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
                <ArtifactTileCard item={item} sizes="(max-width: 760px) 58vw, 21vw" exampleLabel={t.design.example} openLabel={t.a11y.openImage} />
              </li>
            ))}
          </Row>
        )}

        {data.others.length > 0 && (
          <Row id="row-others" title={t.others.title} size="sm" {...arrows}>
            {data.others.map((c) => (
              <li key={c.slug}><TitleCard card={c} locale={locale} sizes="(max-width: 760px) 42vw, 15vw" /></li>
            ))}
          </Row>
        )}

        {data.early.length > 0 && (
          <Row id="row-early" title={t.early.title} size="sm" {...arrows}>
            {data.early.map((c) => (
              <li key={c.slug}><TitleCard card={c} locale={locale} sizes="(max-width: 760px) 42vw, 15vw" /></li>
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
