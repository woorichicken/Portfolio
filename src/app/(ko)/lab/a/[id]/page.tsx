/* eslint-disable @next/next/no-html-link-for-pages -- 시안끼리는 전체 새로고침 이동이 맞다: 화면마다 처음 그려지는 모습을 리뷰한다 */
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Figure from '@/components/Figure';
import Lightbox from '@/components/Lightbox';
import Rich from '@/components/Rich';
import LabArt from '@/components/lab/LabArt';
import { LAB_IDS, getLabProject, getLabProjects, type LabQuote } from '@/components/lab/labData';

// 시안 A 의 케이스 상세 = 새 「프로젝트 블록」.
// 지금 블록은 왼쪽 표 + 오른쪽에 사진·글·카드·숫자·인용이 한 줄로 쌓여 위계가 없다.
// 여기서는 「무엇 → 개요 → 바꾼 것(장) → 결과 → 목소리 → 배운 점」 순서로 장을 나눠, 장마다 한 가지 모양만 쓴다.

export const dynamicParams = false;
export function generateStaticParams() {
  return LAB_IDS.map((id) => ({ id }));
}

const SHORT_QUOTE = 24; // 이보다 짧은 인용은 한 줄 선언처럼 크게 — 긴 인용과 같은 크기면 힘이 빠진다

function QuoteBlock({ q }: { q: LabQuote }) {
  return (
    <figure className={`a-quote${q.text.length <= SHORT_QUOTE ? ' is-short' : ''}`}>
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
  const all = getLabProjects();
  const next = all[(p.index + 1) % all.length];
  const prev = all[(p.index - 1 + all.length) % all.length];
  const tallCover = p.cover.height > p.cover.width;

  return (
    <div className="lab-a a-case">
      <header className="a-top">
        <a className="a-logo" href="/lab/a">
          <Image src="/brand/solhun-sloth-96.png" alt="" width={24} height={24} />
          SOLHUN
        </a>
        <nav aria-label="주 메뉴">
          <a href="/lab/a#work">작업</a>
          <a href="/lab/a#timeline">연표</a>
          <a href="/lab/a#contact">연락</a>
        </nav>
      </header>

      <main>
        <nav className="a-crumb" aria-label="위치"><a href="/lab/a#work">작업</a><span aria-hidden="true">/</span><span>{p.name}</span></nav>

        <header className="a-case-head">
          <p className="a-eyebrow">{p.context}</p>
          <h1>{p.name}</h1>
          <p className="a-case-tag">{p.tagline}</p>
          <dl className="a-meta" style={{ ['--cols' as string]: p.facts.length }}>
            {p.facts.map((f) => (
              <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>
            ))}
          </dl>
          {p.links && (
            <p className="a-case-links">
              {p.links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noreferrer">{l.label} ↗</a>)}
            </p>
          )}
        </header>

        <div className={`a-stage${tallCover ? ' is-tall' : ''}`}>
          <Figure shot={p.cover} sizes="(max-width: 900px) 100vw, 1000px" priority openLabel="이미지 크게 보기" />
        </div>

        <section className="a-sec a-overview" aria-labelledby="ov">
          <h2 id="ov" className="a-label">개요</h2>
          <p className="a-big"><Rich text={p.summary} /></p>
        </section>

        {p.improvements && p.improvements.length > 0 && (
          <section className="a-sec" aria-labelledby="ch">
            <h2 id="ch" className="a-label">바꾼 것</h2>
            <ol className="a-chapters">
              {p.improvements.map((item, i) => (
                <li key={item.title} className="a-chapter">
                  <span className="a-ch-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    {item.badge && <p className="a-ch-badge">{item.badge}</p>}
                    <h3>{item.title}</h3>
                    <div className="a-ba">
                      <div className="a-ba-before"><span>이전</span><p>{item.before}</p></div>
                      <span className="a-ba-arrow" aria-hidden="true">→</span>
                      <div className="a-ba-after"><span>이후</span><p><Rich text={item.after} /></p></div>
                    </div>
                    {item.metric && (
                      <p className="a-ch-metric"><strong>{item.metric.value}</strong><span>{item.metric.label}</span></p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {p.metrics && p.metrics.length > 0 && (
          <section className="a-sec" aria-labelledby="rs">
            <h2 id="rs" className="a-label">결과</h2>
            <dl className="a-results">
              {p.metrics.map((m) => (
                <div key={m.label}><dd>{m.value}</dd><dt>{m.label}</dt></div>
              ))}
            </dl>
          </section>
        )}

        {p.labQuotes.length > 0 && (
          <section className="a-sec" aria-labelledby="vc">
            <h2 id="vc" className="a-label">함께 일한 사람들의 말</h2>
            <div className="a-quotes">
              {p.labQuotes.map((q) => <QuoteBlock key={q.text} q={q} />)}
            </div>
          </section>
        )}

        {p.gallery && p.gallery.length > 0 && (
          <section className="a-sec" aria-labelledby="gl">
            <h2 id="gl" className="a-label">화면</h2>
            <div className="a-gallery">
              {p.gallery.map((s) => (
                <Figure key={s.src} shot={s} className={s.height > s.width ? 'is-tall' : undefined} sizes="(max-width: 760px) 100vw, 50vw" openLabel="이미지 크게 보기" />
              ))}
            </div>
          </section>
        )}

        {p.lesson && (
          <aside className="a-lesson">
            <p className="a-label">배운 점</p>
            <h3>{p.lesson.title}</h3>
            <p><Rich text={p.lesson.body} /></p>
          </aside>
        )}

        <nav className="a-next" aria-label="다른 작업">
          {[prev, next].map((n, i) => (
            <a key={n.id} href={`/lab/a/${n.id}`} className="a-next-card">
              <LabArt className="art" id={n.id} index={n.index} />
              <span className="a-eyebrow">{i === 0 ? '← 이전 작업' : '다음 작업 →'}</span>
              <b>{n.name}</b>
            </a>
          ))}
        </nav>
      </main>

      <footer className="a-contact a-contact-compact">
        <a className="a-mail" href="mailto:solhun.jeong@gmail.com">solhun.jeong@gmail.com</a>
        <p className="a-fine">© 2026 정경훈 · 시안 A</p>
      </footer>
      <Lightbox closeLabel="닫기" prevLabel="이전 이미지" nextLabel="다음 이미지" />
    </div>
  );
}
