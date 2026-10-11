import Header from '@/components/Header';
import Rich, { plain } from '@/components/Rich';
import { BoardDemo, PickerDemo, ProgressDemo, SessionDemo } from '@/components/lab/LabClient';
import { getLabProjects } from '@/components/lab/labData';
import { getContent } from '@/content';
import { projectPath } from '@/i18n/config';

// 시안 B — 크래프트 로그. 레퍼런스(Jakub Krehel · Raphael Salaja)의 「좁은 한 단 + 만져 보는 실험」 구조를
// 지금 사이트의 디자인 시스템(Unbounded 이름, 시그널 블루, 알약 배지, 흰 카드, 남색 연락 영역)으로 옮겼다.

const EXPERIMENTS = [
  { key: 'picker', title: '요소 지목 제보', body: '화면 위 글자·버튼을 집어 바로 제보', from: 'kits', Demo: PickerDemo },
  { key: 'board', title: '리뷰 보드', body: '세로·가로를 한 번에, 화면마다 코멘트', from: 'kits', Demo: BoardDemo },
  { key: 'progress', title: '검수 진행', body: '태블릿 화면 55개 전수 확인', from: 'kits', Demo: ProgressDemo },
  { key: 'session', title: 'AI 세션은 녹색', body: '에이전트가 일하는 세션을 보고 개입', from: 'cli-manager', Demo: SessionDemo },
] as const;

export default function LabBHome() {
  const t = getContent('ko');
  const projects = getLabProjects();
  const nameOf = (id: string) => projects.find((p) => p.id === id)?.name ?? id;

  return (
    <>
      <Header locale="ko" t={t} />
      <main id="main" className="lab labb">
        <section className="labb-intro" aria-labelledby="b-title">
          <p className="labb-word" aria-hidden="true">JEONG <span>(SOLHUN)</span></p>
          <h1 id="b-title">{t.hero.name} <span>— 디자인 엔지니어</span></h1>
          <p className="labb-role">라이트소프트 · CLI Manager 제작자</p>
          <p className="labb-lead"><Rich text={t.hero.lead} /></p>
          <p className="labb-links">
            {t.hero.links.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
          </p>
        </section>

        <section className="labb-sec" aria-labelledby="b-lab">
          <h2 id="b-lab" className="labb-title">실험<span>{EXPERIMENTS.length}</span></h2>
          <p className="labb-sub">실제로 만들어 쓰는 도구를 이 페이지 안에서 작게 재현했습니다. 눌러 보세요.</p>
          <div className="labb-exp-grid">
            {EXPERIMENTS.map(({ key, title, body, from, Demo }) => (
              <figure key={key} className="labb-exp">
                <Demo />
                <figcaption>
                  <b>{title}</b>
                  <span>{body} · <a href={`/lab/b/${from}`}>{nameOf(from)} →</a></span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="labb-sec" aria-labelledby="b-work">
          <h2 id="b-work" className="labb-title">프로젝트<span>{projects.length}</span></h2>
          <ul className="labb-list">
            {projects.map((p) => (
              <li key={p.id}>
                <a href={`/lab/b/${p.id}`}>
                  <span className="labb-l-main"><b>{p.name}</b><span>{p.tagline}</span></span>
                  <span className="pill pill-quiet">{p.period.replace(' – 진행 중', ' –')}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="labb-sec" aria-labelledby="b-others">
          <h2 id="b-others" className="labb-title">그 외<span>{t.others.items.length}</span></h2>
          <ul className="labb-rows">
            {t.others.items.map((o) => (
              <li key={o.slug}><a href={projectPath('ko', o.slug)}><b>{o.name}</b><span>{plain(o.body)}</span></a></li>
            ))}
          </ul>
        </section>

        <section className="labb-sec timeline" aria-labelledby="b-tl">
          <h2 id="b-tl" className="labb-title">연표</h2>
          <ol>
            {t.timeline.items.slice().reverse().map((i) => <li key={i.date}><time>{i.date}</time><p>{i.text}</p></li>)}
          </ol>
        </section>
      </main>

      <footer className="contact contact-compact">
        <div className="wrap labb-foot">
          <a className="contact-email" href={`mailto:${t.contact.email}`}>{t.contact.email}</a>
          <p className="footer-note">© 2026 {t.hero.name} · 시안 B</p>
        </div>
      </footer>
    </>
  );
}
