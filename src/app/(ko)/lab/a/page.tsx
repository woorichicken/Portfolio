/* eslint-disable @next/next/no-html-link-for-pages -- 시안끼리는 전체 새로고침 이동이 맞다: 화면마다 처음 그려지는 모습을 리뷰한다 */
import Image from 'next/image';
import EmailLink from '@/components/EmailLink';
import Header from '@/components/Header';
import Lightbox from '@/components/Lightbox';
import Rich from '@/components/Rich';
import { Icosahedron, RingSphere } from '@/components/Wireframes';
import LabArt from '@/components/lab/LabArt';
import { ArtifactTile } from '@/components/lab/LabArtifact';
import { ThumbSwitch } from '@/components/lab/LabClient';
import { getLabProjects } from '@/components/lab/labData';
import { ARTIFACTS, STANDALONE, type Artifact } from '@/components/lab/labExtras';
import { getContent } from '@/content';

// 시안 A 5회차.
// - 첫 화면·연표는 4회차 그대로(좋음).
// - 프로젝트: 같은 크기 앨범 → 크고·작고·넓고·긴 카드가 섞인 비대칭 배치(H3).
// - 「디자인 엔지니어로서」: 만져 보는 도구를 빼고, 프로젝트 뒤로 옮겨 결과물 미리보기 + 별도 화면(/lab/a/design)으로(H2).
// - 「일하며 배운 것 + 그 외」는 뺐다(H4).

// 카드 모양 — 사진 비율에 맞춰 골랐다(PorterX 는 세로 폰 화면, 엔씨디지텍은 가로로 긴 키비주얼)
const SHAPE: Record<string, 'big' | 'normal' | 'wide' | 'wide-l' | 'tall'> = {
  kits: 'big', fair: 'normal', 'cli-manager': 'normal', automation: 'wide', purple: 'wide', porterx: 'tall', ncdigitec: 'wide-l', content: 'wide-l',
};

export default function LabAHome() {
  const t = getContent('ko');
  const projects = getLabProjects();
  const pick = (project: string, title: string) => ARTIFACTS[project].find((a) => a.title === title)!;
  const preview: Artifact[] = [STANDALONE[0], STANDALONE[1], pick('kits', '리뷰 보드'), pick('content', '카드뉴스 템플릿'), pick('cli-manager', 'AI 세션은 녹색')];

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

        <section className="wrap lab4-sec" id="work" aria-labelledby="work-title">
          <header className="lab4-head">
            <h2 id="work-title">{t.work.title}</h2>
            <p>{t.work.intro}</p>
          </header>
          <ThumbSwitch>
            <ul className="lab5-bento">
              {projects.map((p) => {
                const chips = p.improvements?.map((i) => i.title) ?? [];
                return (
                  <li key={p.id} className={`is-${SHAPE[p.id] ?? 'normal'}`}>
                    <a className="lab5-card" href={`/lab/a/${p.id}`}>
                      {/* 세로로 긴 사진은 넓은 칸에서 잘리면 글자가 반쯤 보인다 — 긴 칸이 아니면 통째로 담는다 */}
                      <div className={`lab-cover${p.cover.height > p.cover.width && SHAPE[p.id] !== 'tall' ? ' is-portrait' : ''}`}>
                        <Image className="photo" src={p.cover.src} alt="" width={p.cover.width} height={p.cover.height} sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 60vw" />
                        <LabArt className="art" id={p.id} index={p.index} label={p.name} />
                      </div>
                      <div className="lab5-text">
                        <p className="lab4-ctx">{p.context}</p>
                        <h3>{p.name}<span aria-hidden="true">→</span></h3>
                        <p className="lab4-tag">{p.tagline}</p>
                        {chips.length > 0 && <ul className="lab4-chips">{chips.slice(0, 4).map((c) => <li key={c}>{c}</li>)}</ul>}
                        <p className="lab4-meta">{p.role} · {p.period}</p>
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>
          </ThumbSwitch>
        </section>

        <section className="wrap lab4-sec" id="design" aria-labelledby="design-title">
          <header className="lab4-head">
            <h2 id="design-title">디자인 엔지니어로서</h2>
            <a className="lab5-more" href="/lab/a/design">결과물 전체 보기 →</a>
          </header>
          <div className="lab5-preview">
            {preview.map((a) => <ArtifactTile key={a.title} a={a} sizes="(max-width: 700px) 100vw, 30vw" />)}
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
          <p className="footer-note">© 2026 {t.hero.name} · 시안 A 5회차</p>
        </div>
      </footer>
      <Lightbox closeLabel={t.a11y.closeImage} prevLabel={t.a11y.prevImage} nextLabel={t.a11y.nextImage} />
    </>
  );
}
