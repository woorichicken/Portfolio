/* eslint-disable @next/next/no-html-link-for-pages -- 시안끼리는 전체 새로고침 이동이 맞다: 화면마다 처음 그려지는 모습을 리뷰한다 */
import type { ComponentType } from 'react';
import { notFound } from 'next/navigation';
import Figure from '@/components/Figure';
import Lightbox from '@/components/Lightbox';
import Rich from '@/components/Rich';
import { BeforeAfter, PickerDemo, SessionDemo } from '@/components/lab/LabClient';
import { LAB_IDS, getLabProject, getLabProjects } from '@/components/lab/labData';

// 시안 B 의 케이스 상세 = 다른 모양의 「프로젝트 블록」.
// 이전/이후를 나란히 늘어놓지 않고 한 자리에서 전환한다 — 읽는 사람이 바뀐 차이를 직접 눌러서 본다.
// 인용은 실제로 받은 메시지처럼 보여 준다(누가 · 어디서가 말풍선 위에).

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
  const all = getLabProjects();
  const next = all[(p.index + 1) % all.length];
  const Demo = DEMOS[p.id];

  return (
    <div className="lab-b b-case">
      <main className="b-col">
        <nav className="b-topbar">
          <a className="b-round" href="/lab/b" aria-label="작업 목록으로">↩</a>
          {p.links?.[0] && <a className="b-round" href={p.links[0].href} target="_blank" rel="noreferrer" aria-label={`${p.links[0].label} 열기`}>↗</a>}
        </nav>

        <header className="b-case-head">
          <h1>{p.name}</h1>
          <p className="b-meta">{p.context} · {p.period} · {p.role}</p>
        </header>
        <p className="b-lead"><Rich text={p.summary} /></p>

        <div className="b-hero-demo">
          {Demo ? <Demo /> : <Figure shot={p.cover} sizes="(max-width: 700px) 100vw, 640px" priority openLabel="이미지 크게 보기" />}
        </div>

        <dl className="b-facts">
          {p.facts.map((f) => <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}
        </dl>

        {p.improvements && p.improvements.length > 0 && (
          <section className="b-sec" aria-labelledby="b-ch">
            <div className="b-sechead"><h2 id="b-ch">바꾼 것</h2><span>{p.improvements.length}</span></div>
            {p.improvements.map((item) => (
              <article key={item.title} className="b-imp">
                {item.badge && <p className="b-badge">{item.badge}</p>}
                <h3>{item.title}</h3>
                <BeforeAfter
                  labels={{ before: '이전', after: '이후' }}
                  before={<p>{item.before}</p>}
                  after={<p><Rich text={item.after} /></p>}
                />
                {item.metric && <p className="b-mono"><strong>{item.metric.value}</strong> {item.metric.label}</p>}
              </article>
            ))}
          </section>
        )}

        {p.metrics && p.metrics.length > 0 && (
          <ul className="b-nums" aria-label="결과">
            {p.metrics.map((m) => <li key={m.label}><strong>{m.value}</strong><span>{m.label}</span></li>)}
          </ul>
        )}

        {p.labQuotes.length > 0 && (
          <section className="b-sec" aria-labelledby="b-vc">
            <div className="b-sechead"><h2 id="b-vc">받은 말</h2></div>
            <ul className="b-msgs">
              {p.labQuotes.map((q) => (
                <li key={q.text} className="b-msg">
                  <span className="b-msg-av" aria-hidden="true">{q.speaker.slice(0, 1)}</span>
                  <div>
                    <p className="b-msg-who"><b>{q.speaker}</b>{q.context && <span>{q.context}</span>}</p>
                    <blockquote><p>{q.text}</p></blockquote>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {p.gallery && p.gallery.length > 0 && (
          <section className="b-sec" aria-labelledby="b-gl">
            <div className="b-sechead"><h2 id="b-gl">화면</h2><span>{p.gallery.length}</span></div>
            <div className="b-strip">
              {p.gallery.map((s) => <Figure key={s.src} shot={s} sizes="320px" openLabel="이미지 크게 보기" />)}
            </div>
          </section>
        )}

        {p.lesson && (
          <section className="b-note" aria-labelledby="b-ls">
            <h2 id="b-ls">배운 점 — {p.lesson.title}</h2>
            <p><Rich text={p.lesson.body} /></p>
          </section>
        )}

        <a className="b-next" href={`/lab/b/${next.id}`}><span>다음</span><b>{next.name}</b><span aria-hidden="true">→</span></a>
      </main>
      <Lightbox closeLabel="닫기" prevLabel="이전 이미지" nextLabel="다음 이미지" />
    </div>
  );
}
