/* eslint-disable @next/next/no-html-link-for-pages -- 시안끼리는 전체 새로고침 이동이 맞다: 화면마다 처음 그려지는 모습을 리뷰한다 */
import Image from 'next/image';
import EmailLink from '@/components/EmailLink';
import Header from '@/components/Header';
import Rich, { plain } from '@/components/Rich';
import { Icosahedron, RingSphere } from '@/components/Wireframes';
import LabArt from '@/components/lab/LabArt';
import { BoardDemo, PickerDemo, ProgressDemo, SessionDemo, ThumbSwitch } from '@/components/lab/LabClient';
import { getLabProjects } from '@/components/lab/labData';
import { DE_POINTS, VIDEOS, getNotes } from '@/components/lab/labExtras';
import { getContent } from '@/content';
import { projectPath } from '@/i18n/config';

// 시안 A 4회차 — 「A 방향 + 더 조밀하게 + 디자인 엔지니어 부분 보강」(4회차 코멘트).
// 첫 화면을 반으로 줄이고 숫자를 그 안에 넣었다. 그 바로 아래에 「디자인 엔지니어링」(만져 보는 도구 · 코드로 만든 영상 ·
// 시스템)을 두고, 프로젝트는 3열 카드로 접는다. 근거가 없는 칸은 「예시」로 남겨 나중에 채운다.

const DEMOS = [
  { key: 'picker', title: '요소 지목 제보', from: 'kits', Demo: PickerDemo },
  { key: 'board', title: '리뷰 보드', from: 'kits', Demo: BoardDemo },
  { key: 'progress', title: '검수 진행 55/55', from: 'kits', Demo: ProgressDemo },
  { key: 'session', title: 'AI 세션은 녹색', from: 'cli-manager', Demo: SessionDemo },
] as const;

// 배운 점의 첫 문장만 — 마침표가 이미 있으면 덧붙이지 않는다
function firstSentence(s: string): string {
  return s.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? s;
}

export default function LabAHome() {
  const t = getContent('ko');
  const projects = getLabProjects();
  const notes = getNotes();
  const atlas = t.others.items.find((o) => o.slug === 'design-atlas');
  const cardShot = projects.find((p) => p.id === 'content')?.gallery?.[0];
  const [reel, ...clips] = VIDEOS;

  return (
    <>
      <Header locale="ko" t={t} />
      <main id="main" className="lab lab4">
        <section className="hero lab4-hero" aria-labelledby="hero-title">
          <div className="hero-glow" aria-hidden="true" />
          <Icosahedron className="hero-wire hero-wire-a" />
          <RingSphere className="hero-wire hero-wire-b" />
          <div className="hero-inner lab4-hero-grid">
            <div>
              <h1 id="hero-title" className="hero-title">
                <span className="hero-mark">JEONG</span> <span className="hero-mark">(SOLHUN)</span>
              </h1>
              <p className="hero-role"><span>{t.hero.name}</span><span aria-hidden="true" className="hero-sep" />디자인 엔지니어 · 라이트소프트 · CLI Manager 제작자</p>
              <p className="hero-lead"><Rich text={t.hero.lead} /></p>
              <p className="hero-links">
                {t.hero.links.map((l) =>
                  l.href.startsWith('mailto:') ? (
                    <EmailLink key={l.href} href={l.href} label={l.label} copiedLabel={t.a11y.copied} />
                  ) : (
                    <a key={l.href} href={l.href} target="_blank" rel="noreferrer">{l.label}</a>
                  ),
                )}
              </p>
            </div>
            <dl className="lab4-hero-stats">
              {t.stats.items.map((s) => <div key={s.label}><dd>{s.value}</dd><dt>{s.label}</dt></div>)}
            </dl>
          </div>
        </section>

        <section className="wrap lab4-sec" id="de" aria-labelledby="de-title">
          <header className="lab4-head">
            <h2 id="de-title">디자인 엔지니어링</h2>
            <p>화면·영상·제품을 코드로 만듭니다. 아래 도구는 이 페이지 안에서 직접 눌러 볼 수 있습니다.</p>
          </header>

          <h3 className="lab4-h3">만져 보는 도구 <span>실제로 만들어 쓰는 도구를 작게 재현</span></h3>
          <div className="lab4-demos">
            {DEMOS.map(({ key, title, from, Demo }) => (
              <figure key={key} className="lab4-demo">
                <Demo />
                <figcaption><b>{title}</b><a href={`/lab/a/${from}`}>{projects.find((p) => p.id === from)?.name} →</a></figcaption>
              </figure>
            ))}
          </div>

          <h3 className="lab4-h3">코드로 만든 영상 <span>Remotion · 제목·길이·역할은 제작 기록 그대로 · <em>공개 전 권리 확인 필요</em></span></h3>
          <div className="lab4-videos">
            <figure className="lab4-video is-reel">
              <div className="lab4-poster"><Image src={reel.poster} alt="" width={1280} height={720} sizes="(max-width: 900px) 100vw, 50vw" /><span className="lab4-play" aria-hidden="true">▶</span><span className="lab4-dur">{reel.duration}</span></div>
              <figcaption><b>{reel.title}</b><span>{reel.role} · {reel.note}</span></figcaption>
            </figure>
            {clips.slice(0, 6).map((v) => (
              <figure key={v.id} className="lab4-video">
                <div className="lab4-poster"><Image src={v.poster} alt="" width={1280} height={720} sizes="(max-width: 900px) 50vw, 18vw" /><span className="lab4-dur">{v.duration}</span></div>
                <figcaption><b>{v.title}</b><span>{v.role}{v.note ? ` · ${v.note}` : ''}</span></figcaption>
              </figure>
            ))}
          </div>

          <h3 className="lab4-h3">시스템 · 사전 · 템플릿</h3>
          <div className="lab4-sys">
            {atlas && (
              <a className="lab4-sys-card" href={projectPath('ko', atlas.slug)}>
                <Image src={atlas.shot.src} alt="" width={atlas.shot.width} height={atlas.shot.height} sizes="(max-width: 900px) 100vw, 25vw" />
                <b>{atlas.name}</b><span>{plain(atlas.body)}</span>
              </a>
            )}
            {cardShot && (
              <a className="lab4-sys-card" href="/lab/a/content">
                <Image src={cardShot.src} alt="" width={cardShot.width} height={cardShot.height} sizes="(max-width: 900px) 100vw, 25vw" />
                <b>카드뉴스 템플릿</b><span>{cardShot.caption}</span>
              </a>
            )}
            <a className="lab4-sys-card" href="/lab/a/fair">
              <span className="lab-ex-shot">예시 — 토큰·컴포넌트 표 캡처 자리</span>
              <b>FAIR 디자인 시스템 핸드오프</b><span>{DE_POINTS.fair[0].body}</span>
            </a>
            <div className="lab4-sys-card lab-ex">
              <span className="lab-ex-shot">예시</span>
              <b>인터랙션 노트</b><span>채울 내용: 버튼 상태·전환 시간·모션 토큰처럼 화면마다 반복해 쓴 규칙 한 장</span>
            </div>
          </div>
        </section>

        <section className="wrap lab4-sec" id="work" aria-labelledby="work-title">
          <header className="lab4-head">
            <h2 id="work-title">{t.work.title}</h2>
            <p>{t.work.intro}</p>
          </header>
          <ThumbSwitch>
            <ul className="lab4-cards">
              {projects.map((p) => {
                const chips = p.improvements?.map((i) => i.title) ?? (DE_POINTS[p.id] ?? []).filter((d) => !d.example).map((d) => d.title);
                return (
                  <li key={p.id}>
                    <a className="lab4-card" href={`/lab/a/${p.id}`}>
                      <div className="lab-cover">
                        <Image className="photo" src={p.cover.src} alt="" width={p.cover.width} height={p.cover.height} sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" />
                        <LabArt className="art" id={p.id} index={p.index} label={p.name} />
                      </div>
                      <p className="lab4-ctx">{p.context}</p>
                      <h3>{p.name}<span aria-hidden="true">→</span></h3>
                      <p className="lab4-tag">{p.tagline}</p>
                      <ul className="lab4-chips">{chips.slice(0, 4).map((c) => <li key={c}>{c}</li>)}</ul>
                      <p className="lab4-meta">{p.role} · {p.period}</p>
                    </a>
                  </li>
                );
              })}
            </ul>
          </ThumbSwitch>
        </section>

        <section className="wrap lab4-sec lab4-split">
          <div>
            <header className="lab4-head"><h2>일하며 배운 것</h2></header>
            <ol className="lab4-notes">
              {notes.map((n) => (
                <li key={n.id}>
                  <a href={`/lab/a/${n.id}#lesson`}><b>{n.title}</b><span className="meta">{n.project}</span></a>
                  <p>{firstSentence(plain(n.body))}</p>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <header className="lab4-head"><h2>{t.others.title}</h2></header>
            <ul className="lab4-rows">
              {t.others.items.map((o) => (
                <li key={o.slug}><a href={projectPath('ko', o.slug)}><b>{o.name}</b><span>{plain(o.body)}</span><time>{o.period.split(' · ')[0]}</time></a></li>
              ))}
              {t.early.items.map((e) => (
                <li key={e.slug}><a href={projectPath('ko', e.slug)}><b>{e.name}</b><span>{plain(e.body)}</span><time>{e.tag}</time></a></li>
              ))}
            </ul>
          </div>
        </section>

        <section className="wrap lab4-sec timeline" id="timeline" aria-labelledby="timeline-title">
          <header className="lab4-head"><h2 id="timeline-title">{t.timeline.title}</h2></header>
          <ol className="lab4-tl">
            {t.timeline.items.slice().reverse().map((item) => (
              <li key={item.date}><time>{item.date}</time><p>{item.text}</p></li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="contact lab4-contact" id="contact" aria-labelledby="contact-title">
        <div className="wrap">
          <h2 id="contact-title" className="visually-hidden">{t.contact.title}</h2>
          <p className="contact-body">{t.contact.body}</p>
          <a className="contact-email" href={`mailto:${t.contact.email}`}>{t.contact.email}</a>
          <p className="contact-links">
            {t.contact.links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noreferrer">{l.label}</a>)}
          </p>
          <p className="footer-note">© 2026 {t.hero.name} · 시안 A 4회차</p>
        </div>
      </footer>
    </>
  );
}
