/* eslint-disable @next/next/no-html-link-for-pages -- 시안끼리는 전체 새로고침 이동이 맞다: 화면마다 처음 그려지는 모습을 리뷰한다 */
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Figure from '@/components/Figure';
import Header from '@/components/Header';
import Lightbox from '@/components/Lightbox';
import Rich from '@/components/Rich';
import LabArt from '@/components/lab/LabArt';
import { CaseToc } from '@/components/lab/LabClient';
import { LAB_IDS, getLabProject, getLabProjects, type LabQuote } from '@/components/lab/labData';
import { ArtifactTile, ChangeArrow } from '@/components/lab/LabArtifact';
import { ARTIFACTS, usedShotSrcs } from '@/components/lab/labExtras';
import { getContent } from '@/content';

// 시안 A 4회차 상세 = 조밀해진 「프로젝트 블록」.
// 머리(배지·이름·한 줄·메타 띠)를 한 띠로 줄이고, 본문은 왼쪽 목차 + 오른쪽 내용 두 단으로 둔다.
// 장 사이 여백을 3회차의 절반으로 줄였고, 「디자인 엔지니어링」 장을 새로 넣었다(근거 없는 칸은 예시).

export const dynamicParams = false;
export function generateStaticParams() {
  return LAB_IDS.map((id) => ({ id }));
}

const SHORT_QUOTE = 24; // 이보다 짧은 말은 첫 화면처럼 파란 판에 크게

function QuoteBlock({ q }: { q: LabQuote }) {
  const short = q.text.length <= SHORT_QUOTE;
  return (
    <figure className={`lab-quote${short ? ' is-short' : ''}`}>
      {short && <div className="hero-glow" aria-hidden="true" />}
      <blockquote><p>{q.text}</p></blockquote>
      <figcaption><b>{q.speaker}</b>{q.context && <span>{q.context}</span>}</figcaption>
    </figure>
  );
}

type Props = { params: Promise<{ id: string }> };

export default async function LabACase({ params }: Props) {
  const { id } = await params;
  const p = getLabProject(id);
  if (!p) notFound();
  const t = getContent('ko');
  const all = getLabProjects();
  const next = all[(p.index + 1) % all.length];
  const prev = all[(p.index - 1 + all.length) % all.length];
  const artifacts = ARTIFACTS[p.id] ?? [];
  // 「디자인 엔지니어링」에 나온 사진은 「화면」에서 빼서 같은 사진이 두 번 나오지 않게 한다
  const used = usedShotSrcs(p.id);
  const screens = (p.gallery ?? []).filter((s) => !used.has(s.src));

  const toc = [
    { id: 'overview', label: '개요' },
    ...(artifacts.length ? [{ id: 'de', label: '디자인 엔지니어링' }] : []),
    ...(p.improvements?.length ? [{ id: 'changes', label: '바꾼 것' }] : []),
    ...(p.metrics?.length ? [{ id: 'results', label: t.work.labels.results }] : []),
    ...(p.labQuotes.length ? [{ id: 'voices', label: '함께 일한 사람들의 말' }] : []),
    ...(screens.length ? [{ id: 'screens', label: '화면' }] : []),
    ...(p.lesson ? [{ id: 'lesson', label: t.work.labels.lesson }] : []),
  ];

  return (
    <>
      <Header locale="ko" t={t} />
      <main id="main" className="lab lab4-case">
        <header className="lab4-case-head">
          <div className="wrap">
            <a className="detail-back" href="/lab/a#work">← 전체 프로젝트</a>
            <div className="lab4-case-title">
              <div>
                <p className="pill">{p.context}</p>
                <h1 className="project-name">{p.name}</h1>
                <p className="project-tagline">{p.tagline}</p>
              </div>
              <dl className="lab4-case-facts">
                {p.facts.map((f) => <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}
                {p.links && (
                  <div><dt>링크</dt><dd className="lab4-links">{p.links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noreferrer">{l.label} ↗</a>)}</dd></div>
                )}
              </dl>
            </div>
          </div>
        </header>

        <div className="wrap lab4-body">
          <aside className="lab4-aside"><CaseToc items={toc} /></aside>

          <div className="lab4-content">
            <section id="overview" className="lab4-block">
              <div className="lab4-cover">
                <Figure shot={p.cover} className={p.cover.height > p.cover.width ? 'cover cover-tall' : 'cover'} sizes="(max-width: 900px) 100vw, 860px" priority openLabel={t.a11y.openImage} />
              </div>
              <p className="lab4-summary"><Rich text={p.summary} /></p>
            </section>

            {artifacts.length > 0 && (
              <section id="de" className="lab4-block" aria-labelledby="de-h">
                <h2 id="de-h" className="lab4-label">디자인 엔지니어링</h2>
                <div className="lab5-arts">
                  {artifacts.map((a) => <ArtifactTile key={a.title} a={a} sizes="(max-width: 700px) 100vw, 300px" />)}
                </div>
              </section>
            )}

            {p.improvements && p.improvements.length > 0 && (
              <section id="changes" className="lab4-block" aria-labelledby="ch-h">
                <h2 id="ch-h" className="lab4-label">바꾼 것</h2>
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

            {p.labQuotes.length > 0 && (
              <section id="voices" className="lab4-block" aria-labelledby="vc-h">
                <h2 id="vc-h" className="lab4-label">함께 일한 사람들의 말</h2>
                <div className="lab4-quotes">{p.labQuotes.map((q) => <QuoteBlock key={q.text} q={q} />)}</div>
              </section>
            )}

            {screens.length > 0 && (
              <section id="screens" className="lab4-block" aria-labelledby="gl-h">
                <h2 id="gl-h" className="lab4-label">화면</h2>
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

            <nav className="lab-next lab4-next" aria-label="다른 프로젝트">
              {[prev, next].map((n, i) => (
                <a key={n.id} href={`/lab/a/${n.id}`} className="lab-next-card">
                  <span className="lab-next-cover">
                    <Image src={n.cover.src} alt="" width={n.cover.width} height={n.cover.height} sizes="160px" />
                    <LabArt className="art" id={n.id} index={n.index} />
                  </span>
                  <span className="meta">{i === 0 ? '← 이전 프로젝트' : '다음 프로젝트 →'}</span>
                  <b>{n.name}</b>
                </a>
              ))}
            </nav>
          </div>
        </div>
      </main>

      <footer className="contact contact-compact">
        <div className="wrap">
          <a className="contact-email" href={`mailto:${t.contact.email}`}>{t.contact.email}</a>
          <p className="footer-note">© 2026 {t.hero.name} · 시안 A 5회차</p>
        </div>
      </footer>
      <Lightbox closeLabel={t.a11y.closeImage} prevLabel={t.a11y.prevImage} nextLabel={t.a11y.nextImage} />
    </>
  );
}
