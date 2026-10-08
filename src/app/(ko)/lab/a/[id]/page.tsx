/* eslint-disable @next/next/no-html-link-for-pages -- 시안끼리는 전체 새로고침 이동이 맞다: 화면마다 처음 그려지는 모습을 리뷰한다 */
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Figure from '@/components/Figure';
import Header from '@/components/Header';
import Lightbox from '@/components/Lightbox';
import Rich from '@/components/Rich';
import LabArt from '@/components/lab/LabArt';
import { LAB_IDS, getLabProject, getLabProjects, type LabQuote } from '@/components/lab/labData';
import { getContent } from '@/content';

// 시안 A 의 케이스 상세 = 새 「프로젝트 블록」. 색·서체·배지·카드는 지금 사이트 것을 그대로 쓰고 배치만 바꾼다.
// 지금 블록: 왼쪽 표 + 오른쪽에 사진·글·카드·숫자·인용이 한 줄로 쌓여 위계가 하나뿐이다.
// 여기서는 레퍼런스(Karl Koch 케이스)처럼 「머리 → 대표 화면 → 개요 → 바꾼 것 → 결과 → 말 → 화면 → 배운 점」 장으로 나눈다.

export const dynamicParams = false;
export function generateStaticParams() {
  return LAB_IDS.map((id) => ({ id }));
}

const SHORT_QUOTE = 24; // 이보다 짧은 말은 첫 화면처럼 파란 판에 크게 — 긴 인용과 같은 크기면 힘이 빠진다

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
  const tallCover = p.cover.height > p.cover.width;

  return (
    <>
      <Header locale="ko" t={t} />
      <main id="main" className="lab lab-case wrap">
        <a className="detail-back" href="/lab/a#work">← 전체 프로젝트</a>

        <header className="lab-case-head">
          <p className="pill">{p.context}</p>
          <h1 className="project-name">{p.name}</h1>
          <p className="project-tagline">{p.tagline}</p>
          <dl className="lab-strip" style={{ ['--cols' as string]: p.facts.length }}>
            {p.facts.map((f) => <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}
          </dl>
          {p.links && (
            <p className="project-links">
              {p.links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noreferrer">{l.label} ↗</a>)}
            </p>
          )}
        </header>

        <div className={`lab-stage${tallCover ? ' is-tall' : ''}`}>
          <Figure shot={p.cover} sizes="(max-width: 900px) 100vw, 1100px" priority openLabel={t.a11y.openImage} />
        </div>

        <section className="lab-row" aria-labelledby="ov">
          <h2 id="ov" className="lab-label">개요</h2>
          <p className="lab-big"><Rich text={p.summary} /></p>
        </section>

        {p.improvements && p.improvements.length > 0 && (
          <section className="lab-row" aria-labelledby="ch">
            <h2 id="ch" className="lab-label">바꾼 것</h2>
            <ol className="lab-chapters">
              {p.improvements.map((item, i) => (
                <li key={item.title}>
                  <span className="lab-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <div className="lab-ch-card">
                    {item.badge && <p className="improvement-badge">{item.badge}</p>}
                    <h3>{item.title}</h3>
                    <div className="lab-ba">
                      <div className="lab-ba-before"><span>{t.work.labels.before}</span><p>{item.before}</p></div>
                      <span className="lab-ba-arrow" aria-hidden="true">→</span>
                      <div className="lab-ba-after"><span>{t.work.labels.after}</span><p><Rich text={item.after} /></p></div>
                    </div>
                    {item.metric && <p className="inline-metric"><strong>{item.metric.value}</strong>{item.metric.label}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {p.metrics && p.metrics.length > 0 && (
          <section className="lab-row" aria-labelledby="rs">
            <h2 id="rs" className="lab-label">{t.work.labels.results}</h2>
            <div className="results lab-results">
              {p.metrics.map((m) => <p key={m.label}><strong>{m.value}</strong><span>{m.label}</span></p>)}
            </div>
          </section>
        )}

        {p.labQuotes.length > 0 && (
          <section className="lab-row" aria-labelledby="vc">
            <h2 id="vc" className="lab-label">함께 일한 사람들의 말</h2>
            <div className="lab-quotes">{p.labQuotes.map((q) => <QuoteBlock key={q.text} q={q} />)}</div>
          </section>
        )}

        {p.gallery && p.gallery.length > 0 && (
          <section className="lab-row" aria-labelledby="gl">
            <h2 id="gl" className="lab-label">화면</h2>
            <div className="gallery lab-gallery">
              {p.gallery.map((s) => (
                <Figure key={s.src} shot={s} className={s.height > s.width ? 'tall' : undefined} sizes="(max-width: 700px) 100vw, 40vw" openLabel={t.a11y.openImage} />
              ))}
            </div>
          </section>
        )}

        {p.lesson && (
          <aside className="lesson lab-lesson">
            <h4>{t.work.labels.lesson} — {p.lesson.title}</h4>
            <p><Rich text={p.lesson.body} /></p>
          </aside>
        )}

        <nav className="lab-next" aria-label="다른 프로젝트">
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
      </main>

      <footer className="contact contact-compact">
        <div className="wrap">
          <a className="contact-email" href={`mailto:${t.contact.email}`}>{t.contact.email}</a>
          <p className="footer-note">© 2026 {t.hero.name} · 시안 A</p>
        </div>
      </footer>
      <Lightbox closeLabel={t.a11y.closeImage} prevLabel={t.a11y.prevImage} nextLabel={t.a11y.nextImage} />
    </>
  );
}
