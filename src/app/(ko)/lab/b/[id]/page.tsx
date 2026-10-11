/* eslint-disable @next/next/no-html-link-for-pages -- 시안끼리는 전체 새로고침 이동이 맞다: 화면마다 처음 그려지는 모습을 리뷰한다 */
import type { ComponentType } from 'react';
import { notFound } from 'next/navigation';
import Figure from '@/components/Figure';
import Header from '@/components/Header';
import Lightbox from '@/components/Lightbox';
import Rich from '@/components/Rich';
import { BeforeAfter, PickerDemo, SessionDemo } from '@/components/lab/LabClient';
import { LAB_IDS, getLabProject, getLabProjects } from '@/components/lab/labData';
import { getContent } from '@/content';

// 시안 B 의 케이스 상세 = 또 다른 「프로젝트 블록」. 카드·배지·숫자는 지금 사이트 것 그대로.
// 이전/이후를 두 줄 표로 늘어놓지 않고, 언어 전환 버튼과 같은 모양의 스위치로 한 자리에서 바꿔 본다.
// 인용은 실제로 받은 메시지처럼(누가 · 어디서가 말풍선 위에) 보여 준다.

export const dynamicParams = false;
export function generateStaticParams() {
  return LAB_IDS.map((id) => ({ id }));
}

// 실험이 있는 프로젝트는 커버 사진 대신 실험을 맨 위에 둔다
const DEMOS: Record<string, ComponentType> = { kits: PickerDemo, 'cli-manager': SessionDemo, automation: SessionDemo };

type Props = { params: Promise<{ id: string }> };

export default async function LabBCase({ params }: Props) {
  const { id } = await params;
  const p = getLabProject(id);
  if (!p) notFound();
  const t = getContent('ko');
  const all = getLabProjects();
  const next = all[(p.index + 1) % all.length];
  const Demo = DEMOS[p.id];

  return (
    <>
      <Header locale="ko" t={t} />
      <main id="main" className="lab labb labb-case">
        <a className="detail-back" href="/lab/b">← 전체 프로젝트</a>
        <header>
          <p className="pill">{p.context}</p>
          <h1 className="project-name">{p.name}</h1>
          <p className="project-tagline">{p.tagline}</p>
        </header>

        <div className="labb-hero-demo">
          {Demo ? <Demo /> : <Figure shot={p.cover} className={p.cover.height > p.cover.width ? 'cover cover-tall' : 'cover'} sizes="(max-width: 760px) 100vw, 720px" priority openLabel={t.a11y.openImage} />}
        </div>

        <p className="project-summary"><Rich text={p.summary} /></p>

        <dl className="facts labb-facts">
          {p.facts.map((f) => <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}
        </dl>
        {p.links && (
          <p className="project-links">
            {p.links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noreferrer">{l.label} ↗</a>)}
          </p>
        )}

        {p.improvements && p.improvements.length > 0 && (
          <section className="labb-sec" aria-labelledby="b-ch">
            <h2 id="b-ch" className="labb-title">바꾼 것<span>{p.improvements.length}</span></h2>
            <ol className="improvements labb-imps">
              {p.improvements.map((item) => (
                <li key={item.title}>
                  {item.badge && <p className="improvement-badge">{item.badge}</p>}
                  <h4>{item.title}</h4>
                  <BeforeAfter
                    labels={{ before: t.work.labels.before, after: t.work.labels.after }}
                    before={<p>{item.before}</p>}
                    after={<p><Rich text={item.after} /></p>}
                  />
                  {item.metric && <p className="inline-metric"><strong>{item.metric.value}</strong>{item.metric.label}</p>}
                </li>
              ))}
            </ol>
          </section>
        )}

        {p.metrics && p.metrics.length > 0 && (
          <div className="results">
            {p.metrics.map((m) => <p key={m.label}><strong>{m.value}</strong><span>{m.label}</span></p>)}
          </div>
        )}

        {p.labQuotes.length > 0 && (
          <section className="labb-sec" aria-labelledby="b-vc">
            <h2 id="b-vc" className="labb-title">받은 말</h2>
            <ul className="labb-msgs">
              {p.labQuotes.map((q) => (
                <li key={q.text}>
                  <span className="labb-av" aria-hidden="true">{q.speaker.slice(0, 1)}</span>
                  <div>
                    <p className="labb-who"><b>{q.speaker}</b>{q.context && <span>{q.context}</span>}</p>
                    <blockquote><p>{q.text}</p></blockquote>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {p.gallery && p.gallery.length > 0 && (
          <section className="labb-sec" aria-labelledby="b-gl">
            <h2 id="b-gl" className="labb-title">화면<span>{p.gallery.length}</span></h2>
            <div className="gallery">
              {p.gallery.map((s) => <Figure key={s.src} shot={s} className={s.height > s.width ? 'tall' : undefined} sizes="(max-width: 700px) 100vw, 360px" openLabel={t.a11y.openImage} />)}
            </div>
          </section>
        )}

        {p.lesson && (
          <aside className="lesson">
            <h4>{t.work.labels.lesson} — {p.lesson.title}</h4>
            <p><Rich text={p.lesson.body} /></p>
          </aside>
        )}

        <a className="labb-next" href={`/lab/b/${next.id}`}><span className="meta">다음</span><b>{next.name}</b><span aria-hidden="true">→</span></a>
      </main>
      <footer className="contact contact-compact">
        <div className="wrap labb-foot">
          <a className="contact-email" href={`mailto:${t.contact.email}`}>{t.contact.email}</a>
          <p className="footer-note">© 2026 {t.hero.name} · 시안 B</p>
        </div>
      </footer>
      <Lightbox closeLabel={t.a11y.closeImage} prevLabel={t.a11y.prevImage} nextLabel={t.a11y.nextImage} />
    </>
  );
}
