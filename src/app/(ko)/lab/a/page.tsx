/* eslint-disable @next/next/no-html-link-for-pages -- 시안끼리는 전체 새로고침 이동이 맞다: 화면마다 처음 그려지는 모습을 리뷰한다 */
import Image from 'next/image';
import Rich, { plain } from '@/components/Rich';
import LabArt from '@/components/lab/LabArt';
import { ThumbSwitch } from '@/components/lab/LabClient';
import { getLabProjects } from '@/components/lab/labData';
import { getContent } from '@/content';
import { projectPath } from '@/i18n/config';

// 시안 A — 짧은 홈 · 깊은 케이스.
// 홈에는 「분류 · 이름 · 무엇 · 내가 한 일」 네 줄짜리 카드만 두고, 이야기는 전부 케이스 상세(/lab/a/[id])로 보낸다.

export default function LabAHome() {
  const t = getContent('ko');
  const projects = getLabProjects();
  const ongoing = projects.filter((p) => p.period.includes('진행 중')).map((p) => p.name);

  return (
    <div className="lab-a">
      <header className="a-top">
        <a className="a-logo" href="/lab/a">
          <Image src="/brand/solhun-sloth-96.png" alt="" width={24} height={24} />
          SOLHUN
        </a>
        <nav aria-label="주 메뉴">
          <a href="#work">작업</a>
          <a href="#timeline">연표</a>
          <a href="#contact">연락</a>
        </nav>
      </header>

      <main>
        <section className="a-hero" aria-labelledby="a-hero-title">
          <p className="a-eyebrow">정경훈 · JEONG (SOLHUN)</p>
          <h1 id="a-hero-title">처음부터 끝까지 관여하는<br />디자인 엔지니어.</h1>
          <p className="a-lead"><Rich text={t.hero.lead} /></p>
          <p className="a-now"><span className="a-dot" aria-hidden="true" />지금 진행 중 — {ongoing.join(' · ')}</p>
          <dl className="a-stats">
            {t.stats.items.map((s) => (
              <div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>
            ))}
          </dl>
        </section>

        <section className="a-work" id="work" aria-labelledby="a-work-title">
          <div className="a-sechead">
            <h2 id="a-work-title">대표 작업</h2>
            <p>{t.work.intro}</p>
          </div>
          <ThumbSwitch>
            <ul className="a-cards">
              {projects.map((p) => (
                <li key={p.id}>
                  <a className="a-card" href={`/lab/a/${p.id}`}>
                    <div className="a-thumb">
                      <LabArt className="art" id={p.id} index={p.index} label={p.id} />
                      <Image className="photo" src={p.cover.src} alt="" width={p.cover.width} height={p.cover.height} sizes="(max-width: 760px) 100vw, 50vw" />
                    </div>
                    <div className="a-card-text">
                      <p className="a-card-eyebrow">{p.context}</p>
                      <h3>{p.name}<span aria-hidden="true">→</span></h3>
                      <p className="a-card-what">{p.tagline}</p>
                      <p className="a-card-role">{p.role} · {p.period}</p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </ThumbSwitch>
        </section>

        <section className="a-others" aria-labelledby="a-others-title">
          <h2 id="a-others-title">그 외</h2>
          <ul>
            {t.others.items.map((o) => (
              <li key={o.slug}>
                <a href={projectPath('ko', o.slug)}>
                  <span className="a-o-name">{o.name}</span>
                  <span className="a-o-body">{plain(o.body)}</span>
                  <span className="a-o-date">{o.period}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="a-timeline" id="timeline" aria-labelledby="a-tl-title">
          <h2 id="a-tl-title">연표</h2>
          <ol>
            {t.timeline.items.slice().reverse().map((item) => (
              <li key={item.date}><time>{item.date}</time><p>{item.text}</p></li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="a-contact" id="contact">
        <p className="a-eyebrow">{t.contact.title}</p>
        <a className="a-mail" href={`mailto:${t.contact.email}`}>{t.contact.email}</a>
        <p className="a-links">
          {t.contact.links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noreferrer">{l.label}</a>)}
        </p>
        <p className="a-fine">© 2026 정경훈 · 시안 A</p>
      </footer>
    </div>
  );
}
