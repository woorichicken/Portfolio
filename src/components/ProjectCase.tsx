import Image from 'next/image';
import { projectArtifacts } from '@/content/artifacts';
import { getContent } from '@/content';
import type { Project, Quote } from '@/content/types';
import { localePath, projectPath, type Locale } from '@/i18n/config';
import ArtifactTile, { ChangeArrow } from './ArtifactTile';
import CaseToc from './CaseToc';
import FeedbackGate from './feedback/FeedbackGate';
import Figure from './Figure';
import Header from './Header';
import Lightbox from './Lightbox';
import Rich from './Rich';

// 큰 프로젝트의 상세(/projects/<id>) — 2026-10 디자인 엔지니어 개편의 「프로젝트 블록」.
// 머리 띠(배지·이름·한 줄·사실 표) → 왼쪽 따라오는 목차 + 오른쪽 장: 개요 → 디자인 엔지니어링(결과물만) → 바꾼 것 →
// 결과 → 함께 일한 사람들의 말 → 화면 → 배운 점 → 이전·다음 프로젝트.

// 이보다 짧은 인용은 첫 화면처럼 파란 판에 크게 — 긴 인용과 같은 크기면 힘이 빠진다.
// 한글은 글자가 넓어 같은 길이가 더 길게 보여 기준을 따로 둔다.
const SHORT_QUOTE: Record<Locale, number> = { ko: 24, en: 44, es: 44 };

/** 인용 출처를 「누가(굵게) · 어디서·언제(흐리게)」로 나눈다 — 콘텐츠는 「누가 — 어디서」 한 줄로 적혀 있다 */
function splitWho(q: Quote): { speaker: string; context: string } {
  const [speaker, ...rest] = q.who.split(' — ');
  return { speaker, context: rest.join(' — ') };
}

export default function ProjectCase({ locale, project: p }: { locale: Locale; project: Project }) {
  const t = getContent(locale);
  const L = t.work.caseLabels;
  const all = t.work.projects;
  const index = all.findIndex((x) => x.id === p.id);
  const prev = all[(index - 1 + all.length) % all.length];
  const next = all[(index + 1) % all.length];
  const artifacts = projectArtifacts(p.id, locale);
  // 「디자인 엔지니어링」에 나온 사진은 「화면」에서 빼서 같은 사진이 두 번 나오지 않게 한다
  const used = new Set(artifacts.flatMap((a) => ('shot' in a ? [a.shot.src] : [])));
  const screens = (p.gallery ?? []).filter((s) => !used.has(s.src));
  // 결과물이 「예시」뿐이면 장 전체를 피드백 모드에서만 보여 준다(일반 방문자에게 빈 장이 보이지 않게)
  const deExamplesOnly = artifacts.length > 0 && artifacts.every((a) => 'example' in a);

  const toc = [
    { id: 'overview', label: L.overview },
    ...(artifacts.length ? [{ id: 'de', label: L.design, examplesOnly: deExamplesOnly }] : []),
    ...(p.improvements?.length ? [{ id: 'changes', label: L.changes }] : []),
    ...(p.metrics?.length ? [{ id: 'results', label: t.work.labels.results }] : []),
    ...(p.quotes?.length ? [{ id: 'voices', label: L.voices }] : []),
    ...(screens.length ? [{ id: 'screens', label: L.screens }] : []),
    ...(p.lesson ? [{ id: 'lesson', label: t.work.labels.lesson }] : []),
  ];

  return (
    <>
      <a className="skip-link" href="#main">{t.a11y.skip}</a>
      <Header locale={locale} t={t} altPath={(l) => projectPath(l, p.id)} />
      <main id="main" className="lab lab4-case">
        <header className="lab4-case-head">
          <div className="wrap">
            <a className="detail-back" href={`${localePath(locale)}#work`}>{L.back}</a>
            <div className="lab4-case-title">
              <div>
                <p className="pill">{p.context}</p>
                <h1 className="project-name">{p.name}</h1>
                <p className="project-tagline">{p.tagline}</p>
              </div>
              <dl className="lab4-case-facts">
                {p.facts.map((f) => <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}
                {p.links && (
                  <div><dt>{L.links}</dt><dd className="lab4-links">{p.links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noreferrer">{l.label} ↗</a>)}</dd></div>
                )}
              </dl>
            </div>
          </div>
        </header>

        <div className="wrap lab4-body">
          <aside className="lab4-aside">
            <CaseToc items={toc.filter((i) => !('examplesOnly' in i && i.examplesOnly))} label={L.toc} />
          </aside>

          <article className="lab4-content">
            <section id="overview" className="lab4-block">
              <div className="lab4-cover">
                <Figure shot={p.cover} className={p.cover.height > p.cover.width ? 'cover cover-tall' : 'cover'} sizes="(max-width: 900px) 100vw, 860px" priority openLabel={t.a11y.openImage} />
              </div>
              <p className="lab4-summary"><Rich text={p.summary} /></p>
            </section>

            {artifacts.length > 0 && (
              <section id="de" className="lab4-block" aria-labelledby="de-h" data-example={deExamplesOnly ? '' : undefined}>
                <h2 id="de-h" className="lab4-label">{L.design}</h2>
                <div className="lab5-arts">
                  {artifacts.map((a) => <ArtifactTile key={a.title} a={a} sizes="(max-width: 700px) 100vw, 300px" exampleLabel={t.design.example} openLabel={t.a11y.openImage} />)}
                </div>
              </section>
            )}

            {p.improvements && p.improvements.length > 0 && (
              <section id="changes" className="lab4-block" aria-labelledby="ch-h">
                <h2 id="ch-h" className="lab4-label">{L.changes}</h2>
                <ol className="lab4-changes">
                  {p.improvements.map((item, i) => (
                    <li key={item.title}>
                      <div className="lab4-ch-title">
                        <span className="lab-num">{String(i + 1).padStart(2, '0')}</span>
                        <h3>{item.title}</h3>
                        {item.badge && <span className="improvement-badge">{item.badge}</span>}
                      </div>
                      <div className="lab-ba">
                        <div className="lab-ba-before"><span>{t.work.labels.before}</span><p>{item.before}</p></div>
                        <ChangeArrow />
                        <div className="lab-ba-after"><span>{t.work.labels.after}</span><p><Rich text={item.after} /></p></div>
                      </div>
                      {item.metric && <p className="inline-metric"><strong>{item.metric.value}</strong>{item.metric.label}</p>}
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {p.metrics && p.metrics.length > 0 && (
              <section id="results" className="lab4-block" aria-labelledby="rs-h">
                <h2 id="rs-h" className="lab4-label">{t.work.labels.results}</h2>
                <div className="results lab4-results">
                  {p.metrics.map((m) => <p key={m.label}><strong>{m.value}</strong><span>{m.label}</span></p>)}
                </div>
              </section>
            )}

            {p.quotes && p.quotes.length > 0 && (
              <section id="voices" className="lab4-block" aria-labelledby="vc-h">
                <h2 id="vc-h" className="lab4-label">{L.voices}</h2>
                <div className="lab4-quotes">
                  {p.quotes.map((q) => {
                    const { speaker, context } = splitWho(q);
                    const short = q.text.length <= SHORT_QUOTE[locale];
                    return (
                      <figure key={q.text} className={`lab-quote${short ? ' is-short' : ''}`}>
                        {short && <div className="hero-glow" aria-hidden="true" />}
                        <blockquote><p>{q.text}</p></blockquote>
                        <figcaption><b>{speaker}</b>{context && <span>{context}</span>}</figcaption>
                      </figure>
                    );
                  })}
                </div>
              </section>
            )}

            {screens.length > 0 && (
              <section id="screens" className="lab4-block" aria-labelledby="gl-h">
                <h2 id="gl-h" className="lab4-label">{L.screens}</h2>
                <div className="lab4-gallery">
                  {screens.map((s) => <Figure key={s.src} shot={s} className={s.height > s.width ? 'tall' : undefined} sizes="(max-width: 700px) 100vw, 280px" openLabel={t.a11y.openImage} />)}
                </div>
              </section>
            )}

            {p.lesson && (
              <aside id="lesson" className="lesson lab4-lesson">
                <h4>{t.work.labels.lesson} — {p.lesson.title}</h4>
                <p><Rich text={p.lesson.body} /></p>
              </aside>
            )}

            <nav className="lab-next lab4-next" aria-label={`${L.prev} / ${L.next}`}>
              {[prev, next].map((n, i) => (
                <a key={n.id} href={projectPath(locale, n.id)} className="lab-next-card">
                  <span className="lab-next-cover"><Image src={n.cover.src} alt="" width={n.cover.width} height={n.cover.height} sizes="160px" /></span>
                  <span className="meta">{i === 0 ? L.prev : L.next}</span>
                  <b>{n.name}</b>
                </a>
              ))}
            </nav>
          </article>
        </div>
      </main>

      <footer className="contact contact-compact">
        <div className="wrap">
          <a className="contact-email" href={`mailto:${t.contact.email}`}>{t.contact.email}</a>
          <p className="footer-note">© 2026 {t.hero.name} · {t.footer.note}</p>
        </div>
      </footer>
      <Lightbox closeLabel={t.a11y.closeImage} prevLabel={t.a11y.prevImage} nextLabel={t.a11y.nextImage} />
      <FeedbackGate copy={t.feedback} />
    </>
  );
}
