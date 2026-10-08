import Image from 'next/image';
import Rich, { plain } from '@/components/Rich';
import { BoardDemo, PickerDemo, ProgressDemo, SessionDemo } from '@/components/lab/LabClient';
import { getLabProjects } from '@/components/lab/labData';
import { getContent } from '@/content';
import { projectPath } from '@/i18n/config';

// 시안 B — 크래프트 로그. 좁은 한 단, 글은 짧게, 증거는 페이지 안에서 직접 만져 보는 실험.

const EXPERIMENTS = [
  { key: 'picker', title: '요소 지목 제보', body: '화면 위 글자·버튼을 집어 바로 제보', from: 'kits', Demo: PickerDemo },
  { key: 'board', title: '리뷰 보드', body: '세로·가로를 한 번에, 화면마다 코멘트', from: 'kits', Demo: BoardDemo },
  { key: 'progress', title: '검수 진행', body: '태블릿 화면 55개 전수 확인', from: 'kits', Demo: ProgressDemo },
  { key: 'session', title: 'AI 세션은 녹색', body: '에이전트가 일하는 세션을 보고 개입', from: 'cli-manager', Demo: SessionDemo },
] as const;

function initials(name: string): string {
  const latin = name.match(/[A-Z]/g);
  return latin && latin.length >= 2 ? latin.slice(0, 2).join('') : name.slice(0, 1);
}

export default function LabBHome() {
  const t = getContent('ko');
  const projects = getLabProjects();
  const nameOf = (id: string) => projects.find((p) => p.id === id)?.name ?? id;

  return (
    <div className="lab-b">
      <main className="b-col">
        <header className="b-intro">
          <Image src="/brand/solhun-sloth-96.png" alt="" width={44} height={44} className="b-avatar" />
          <h1>정경훈</h1>
          <p className="b-role">디자인 엔지니어 · 라이트소프트 · CLI Manager 제작자</p>
          <p><Rich text={t.hero.lead} /></p>
          <p className="b-links">
            {t.hero.links.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
          </p>
        </header>

        <section className="b-sec" aria-labelledby="b-lab-title">
          <div className="b-sechead"><h2 id="b-lab-title">실험</h2><span>{EXPERIMENTS.length}</span></div>
          <p className="b-sub">실제로 만들어 쓰는 도구를 이 페이지 안에서 작게 재현했습니다. 눌러 보세요.</p>
          <div className="b-exp-grid">
            {EXPERIMENTS.map(({ key, title, body, from, Demo }) => (
              <figure key={key} className="b-exp">
                <Demo />
                <figcaption>
                  <b>{title}</b>
                  <span>{body} · <a href={`/lab/b/${from}`}>{nameOf(from)} →</a></span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="b-sec" aria-labelledby="b-work-title">
          <div className="b-sechead"><h2 id="b-work-title">작업</h2><span>{projects.length}</span></div>
          <ul className="b-list">
            {projects.map((p) => (
              <li key={p.id}>
                <a href={`/lab/b/${p.id}`}>
                  <span className="b-icon" aria-hidden="true">{initials(p.name)}</span>
                  <span className="b-l-main"><b>{p.name}</b><span>{p.tagline}</span></span>
                  <span className="b-l-date">{p.period.replace(' – 진행 중', ' –')}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="b-sec" aria-labelledby="b-others-title">
          <div className="b-sechead"><h2 id="b-others-title">그 외</h2><span>{t.others.items.length}</span></div>
          <ul className="b-rows">
            {t.others.items.map((o) => (
              <li key={o.slug}><a href={projectPath('ko', o.slug)}><b>{o.name}</b><span>{plain(o.body)}</span></a></li>
            ))}
          </ul>
        </section>

        <section className="b-sec" aria-labelledby="b-tl-title">
          <div className="b-sechead"><h2 id="b-tl-title">연표</h2></div>
          <ol className="b-tl">
            {t.timeline.items.slice().reverse().map((i) => <li key={i.date}><time>{i.date}</time><span>{i.text}</span></li>)}
          </ol>
        </section>

        <footer className="b-foot">
          <a href={`mailto:${t.contact.email}`}>{t.contact.email}</a>
          <span>© 2026 정경훈 · 시안 B</span>
        </footer>
      </main>
    </div>
  );
}
