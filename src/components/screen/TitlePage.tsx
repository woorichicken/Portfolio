import Image from 'next/image';
import type { ReactNode } from 'react';
import { projectArtifacts } from '@/content/artifacts';
import { getContent, type WorkEntry } from '@/content';
import type { Shot } from '@/content/images';
import { screenCopy } from '@/content/roles';
import { similarTitles } from '@/content/screen-data';
import type { SiteDocs } from '@/content/schema';
import type { Fact, Link, Project, Quote } from '@/content/types';
import { projectPath, type Locale } from '@/i18n/config';
import Figure from '../Figure';
import Rich from '../Rich';
import { ArtifactTileCard, SimilarCard } from './Cards';
import { DetailTabs, Tip, type TabPanel } from './DetailClient';
import { IconClose, IconExternal } from './icons';
import { BackToList } from './RoleClient';
import Shell from './Shell';
import { isMediaSrc } from '@/content/images';

// 작품 상세(/projects/<slug>) — 큰 프로젝트와 「그 외」·「이전」을 같은 틀로 그린다.
// 넷플릭스 상세 창(882px 시트 · 위 16:9 · 정보 2:1 칸)을 페이지로 옮겼다: 주소가 있어 링크로 보내고 검색엔진도 읽는다.
// 위: 16:9 그림 + 그 위 이름 · 사이트 열기(있을 때만) → 정보(왼쪽 사실 · 한 줄 · 요약 / 오른쪽 함께 · 링크)
// 아래: 탭 — 개요(함께 일한 사람들의 말 · 배운 점) · 맡은 일(회차 목록 + 특별편 「바꾼 것」) · 화면 · 비슷한 작품 · 자세히.
// 빈 탭은 만들지 않는다. 3회차 리뷰: 결과 숫자 · 메일 보내기 · 링크 복사는 뺐다(D4 · D5).

type Model = {
  slug: string;
  name: string;
  kicker: string;
  cover: Shot;
  tagline?: string;
  summary: string;
  facts: Fact[];
  links: Link[];
  parts: NonNullable<Project['parts']>;
  improvements: Project['improvements'];
  quotes: Quote[];
  lesson?: Project['lesson'];
  paragraphs: string[];
  gallery: Shot[];
  isProject: boolean;
};

function fromProject(p: Project): Model {
  return {
    slug: p.id, name: p.name, kicker: p.context, cover: p.cover, tagline: p.tagline, summary: p.summary, facts: p.facts,
    links: p.links ?? [], parts: p.parts ?? [], improvements: p.improvements, quotes: p.quotes ?? [], lesson: p.lesson,
    paragraphs: [], gallery: p.gallery ?? [], isProject: true,
  };
}

function fromEntry(e: WorkEntry): Model {
  return {
    slug: e.slug, name: e.name, kicker: e.meta, cover: e.shot, summary: e.body, facts: e.detail.facts,
    links: e.detail.links ?? [], parts: [], improvements: undefined, quotes: [], lesson: undefined,
    paragraphs: e.detail.paragraphs, gallery: [], isProject: false,
  };
}

/** 인용 출처 「누가 — 어디서」를 둘로 나눈다 */
function splitWho(q: Quote) {
  const [speaker, ...rest] = q.who.split(' — ');
  return { speaker, context: rest.join(' — ') };
}

// 사실 표의 첫 칸(기간)과 둘째 칸(역할)은 머리 칩으로, 「함께」는 이름 아래 한 줄로 올린다
const CREDIT_LABELS = ['함께', 'With', 'Con', '팀', 'Team', 'Equipo'];

export default function TitlePage({ site: docs, locale, project, entry }: { site: SiteDocs; locale: Locale; project?: Project; entry?: WorkEntry }) {
  const t = getContent(docs, locale);
  const s = screenCopy(locale);
  const m = project ? fromProject(project) : fromEntry(entry!);
  const site = m.links[0];
  const artifacts = m.isProject ? projectArtifacts(m.slug, locale).map((artifact) => ({ artifact })) : [];
  // 결과물로 이미 나온 사진은 「화면」 아래 갤러리에서 빼서 같은 사진이 두 번 나오지 않게 한다
  const used = new Set(artifacts.flatMap(({ artifact }) => ('shot' in artifact ? [artifact.shot.src] : [])));
  const gallery = m.gallery.filter((g) => !used.has(g.src));
  const similar = similarTitles(docs, locale, m.slug);
  const credits = m.facts.filter((f) => CREDIT_LABELS.includes(f.label));
  const chips = m.facts.filter((f) => !CREDIT_LABELS.includes(f.label)).slice(0, 3);

  const panels: TabPanel[] = [];
  const overview: ReactNode[] = [];
  if (m.quotes.length) {
    overview.push(
      <section key="voices">
        <h2 className="panel-h">{s.voices}</h2>
        <div className="quotes">
          {m.quotes.map((q) => {
            const { speaker, context } = splitWho(q);
            return (
              <figure key={q.text} className="quote">
                <blockquote><p>{q.text}</p></blockquote>
                <figcaption><b>{speaker}</b>{context && <> · {context}</>}</figcaption>
              </figure>
            );
          })}
        </div>
      </section>,
    );
  }
  if (m.paragraphs.length) {
    overview.push(<div key="paras" className="paras">{m.paragraphs.map((p) => <p key={p}><Rich text={p} /></p>)}</div>);
  }
  if (m.lesson) {
    overview.push(
      <section key="lesson">
        <h2 className="panel-h">{s.lesson}</h2>
        <div className="lesson"><h3>{m.lesson.title}</h3><p><Rich text={m.lesson.body} /></p></div>
      </section>,
    );
  }
  if (overview.length) panels.push({ id: 'overview', label: s.tabOverview, content: <>{overview}</> });

  // 맡은 일 — 넷플릭스 회차 목록처럼 「이 프로젝트에서 제가 한 부분」을 번호로 훑게 하고,
  // 전후가 있는 개선(바꾼 것)은 그 아래 「특별편」으로 내린다(3회차 리뷰 D6)
  const episode = (num: string, title: string, body: ReactNode, badge?: string, tip?: ReactNode) => (
    <li key={title} className="episode">
      <span className="ep-num">{num}</span>
      <div className="ep-main">
        {badge && <p className="ep-badge">{badge}</p>}
        <h3 className="ep-title">{title}{tip}</h3>
        {body}
      </div>
    </li>
  );
  if (m.parts.length || m.improvements?.length) {
    panels.push({
      id: 'changes',
      label: s.tabChanges,
      content: (
        <>
          {m.parts.length > 0 && (
            <section>
              <h2 className="panel-h">{s.tabChanges}</h2>
              <ol className="episodes">
                {m.parts.map((part, i) => episode(String(i + 1), part.title, <p className="ep-body">{part.body}</p>))}
              </ol>
            </section>
          )}
          {m.improvements && m.improvements.length > 0 && (
            <section>
              <h2 className="panel-h">{s.specials}</h2>
              <ol className="episodes is-specials">
                {m.improvements.map((it, i) => episode(
                  String(i + 1),
                  it.title,
                  <>
                    <div className="ep-ba">
                      <div><span>{t.work.labels.before}</span><p>{it.before}</p></div>
                      <div><span>{t.work.labels.after}</span><p><Rich text={it.after} /></p></div>
                    </div>
                  </>,
                  it.badge,
                  it.metric && (
                    <Tip id={`tip-${m.slug}-${i}`} label={`${it.title} — ${s.proof}`}>
                      <strong>{it.metric.value}</strong> {it.metric.label}
                    </Tip>
                  ),
                ))}
              </ol>
            </section>
          )}
        </>
      ),
    });
  }

  if (artifacts.length || gallery.length || !m.isProject) {
    const shots = m.isProject ? gallery : [m.cover];
    panels.push({
      id: 'screens',
      label: s.tabScreens,
      content: (
        <>
          {artifacts.length > 0 && (
            <ul className="similar">
              {artifacts.map((item) => (
                <li key={item.artifact.title}>
                  <ArtifactTileCard item={item} sizes="(max-width: 760px) 50vw, 300px" openLabel={t.a11y.openImage} />
                </li>
              ))}
            </ul>
          )}
          {shots.length > 0 && (
            <div className="shots" style={artifacts.length ? { marginTop: 24 } : undefined}>
              {shots.map((g) => <Figure key={g.src} shot={g} className={g.height > g.width ? 'tall' : undefined} sizes="(max-width: 640px) 100vw, 320px" openLabel={t.a11y.openImage} />)}
            </div>
          )}
        </>
      ),
    });
  }

  if (similar.length) {
    panels.push({
      id: 'similar',
      label: s.tabSimilar,
      content: (
        <ul className="similar">
          {similar.map((c) => <li key={c.slug}><SimilarCard card={c} locale={locale} sizes="(max-width: 760px) 50vw, 300px" /></li>)}
        </ul>
      ),
    });
  }

  panels.push({
    id: 'details',
    label: s.tabDetails,
    content: (
      <>
        <h2 className="details-h">{s.aboutOf.replace('{name}', m.name)}</h2>
        <dl className="details">
          {m.facts.map((f) => <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}
          {m.links.length > 0 && (
            <div><dt>{s.links}</dt><dd>{m.links.map((l, i) => <span key={l.href}>{i > 0 && ' · '}<a href={l.href} target="_blank" rel="noreferrer">{l.label} ↗</a></span>)}</dd></div>
          )}
        </dl>
      </>
    ),
  });

  const portrait = m.cover.height > m.cover.width;
  return (
    <Shell site={docs} locale={locale} altPath={(l) => projectPath(l, m.slug)}>
      {/* 시트 뒤 바탕 — 대표 그림을 흐리게 깔아 「목록 위에 열린 창」처럼 보이게 한다 */}
      <div className="title-backdrop" aria-hidden="true">
        <Image src={m.cover.src} unoptimized={isMediaSrc(m.cover.src)} alt="" width={m.cover.width} height={m.cover.height} sizes="10vw" />
      </div>
      <article className="title-sheet">
        <div className="title-hero">
          <a className={`title-hero-media${portrait ? ' is-portrait' : ''}`} href={m.cover.src} data-lightbox="" data-alt={m.cover.alt} data-caption={m.cover.caption ?? m.name} aria-label={`${t.a11y.openImage}: ${m.cover.alt}`}>
            <Image src={m.cover.src} unoptimized={isMediaSrc(m.cover.src)} alt={m.cover.alt} width={m.cover.width} height={m.cover.height} sizes="(max-width: 1000px) 100vw, 960px" priority />
          </a>
          <BackToList locale={locale} className="round title-close" label={s.backToList}><IconClose /></BackToList>
          <div className="title-head">
            <p className="title-kicker">{m.kicker}</p>
            <h1 className="title-name">{m.name}</h1>
            {site && (
              <div className="title-actions">
                <a className="btn btn-primary btn-lg" href={site.href} target="_blank" rel="noreferrer"><IconExternal />{s.openSite}<span className="visually-hidden"> {s.newTab}</span></a>
              </div>
            )}
          </div>
        </div>

        <div className="title-info">
          <div>
            {chips.length > 0 && <ul className="dot-list title-meta">{chips.map((f) => <li key={f.label}>{f.value}</li>)}</ul>}
            {m.tagline && <p className="title-tagline">{m.tagline}</p>}
            <p className="title-summary"><Rich text={m.summary} /></p>
          </div>
          {(credits.length > 0 || m.links.length > 0) && (
            <dl className="title-tags">
              {credits.map((f) => <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}
              {m.links.length > 0 && (
                <div><dt>{s.links}</dt><dd>{m.links.map((l, i) => <span key={l.href}>{i > 0 && ', '}<a href={l.href} target="_blank" rel="noreferrer">{l.label}</a></span>)}</dd></div>
              )}
            </dl>
          )}
        </div>

        <DetailTabs panels={panels} label={s.tabsLabel} />
      </article>
    </Shell>
  );
}
