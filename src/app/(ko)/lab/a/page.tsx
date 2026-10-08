import Image from 'next/image';
import EmailLink from '@/components/EmailLink';
import Header from '@/components/Header';
import Rich from '@/components/Rich';
import { Icosahedron, RingSphere } from '@/components/Wireframes';
import LabArt from '@/components/lab/LabArt';
import { ThumbSwitch } from '@/components/lab/LabClient';
import { getLabProjects } from '@/components/lab/labData';
import { getContent } from '@/content';
import { projectPath } from '@/i18n/config';

// 시안 A — 지금 사이트의 디자인 시스템(첫 화면·숫자·그 외·연표·연락)은 그대로 두고,
// 「프로젝트」만 레퍼런스(Karl Koch 의 Selected work)처럼 카드로 접어 상세 페이지로 보낸다.
// 지금은 큰 프로젝트 8개가 홈에 블록째 펼쳐져 홈이 2만 px 이 넘는다.

export default function LabAHome() {
  const t = getContent('ko');
  const projects = getLabProjects();

  return (
    <>
      <Header locale="ko" t={t} />
      <main id="main" className="lab">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-glow" aria-hidden="true" />
          <Icosahedron className="hero-wire hero-wire-a" />
          <RingSphere className="hero-wire hero-wire-b" />
          <div className="hero-inner">
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
        </section>

        <section className="stats wrap" aria-label={t.stats.title}>
          {t.stats.items.map((s) => (
            <p key={s.label}><strong>{s.value}</strong><span>{s.label}</span></p>
          ))}
        </section>

        <section className="work wrap" id="work" aria-labelledby="work-title">
          <h2 id="work-title" className="section-title">{t.work.title}</h2>
          <p className="section-intro">{t.work.intro}</p>
          <ThumbSwitch>
            <ul className="lab-cards">
              {projects.map((p) => (
                <li key={p.id}>
                  <a className="lab-card" href={`/lab/a/${p.id}`}>
                    <div className="lab-cover">
                      <Image className="photo" src={p.cover.src} alt="" width={p.cover.width} height={p.cover.height} sizes="(max-width: 900px) 100vw, 60vw" />
                      <LabArt className="art" id={p.id} index={p.index} label={p.name} />
                    </div>
                    <div className="lab-card-text">
                      <p className="pill">{p.context}</p>
                      <h3 className="lab-card-name">{p.name}<span aria-hidden="true">→</span></h3>
                      <p className="lab-card-tag">{p.tagline}</p>
                      <dl className="lab-card-facts">
                        <div><dt>역할</dt><dd>{p.role}</dd></div>
                        <div><dt>기간</dt><dd>{p.period}</dd></div>
                      </dl>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </ThumbSwitch>
        </section>

        <section className="others wrap" aria-labelledby="others-title">
          <h2 id="others-title" className="section-title">{t.others.title}</h2>
          <p className="section-intro">{t.others.intro}</p>
          <ul className="others-grid">
            {t.others.items.slice(0, 6).map((o) => (
              <li key={o.slug}>
                <a className="thumb" href={projectPath('ko', o.slug)} tabIndex={-1} aria-hidden="true">
                  <Image src={o.shot.src} alt="" width={o.shot.width} height={o.shot.height} sizes="(max-width: 700px) 100vw, 30vw" />
                </a>
                <h3><a href={projectPath('ko', o.slug)}>{o.name}</a></h3>
                <p className="meta">{o.period}</p>
                <p><Rich text={o.body} /></p>
              </li>
            ))}
          </ul>
        </section>

        <section className="timeline wrap" id="timeline" aria-labelledby="timeline-title">
          <h2 id="timeline-title" className="section-title">{t.timeline.title}</h2>
          <ol>
            {t.timeline.items.map((item) => (
              <li key={item.date}><time>{item.date}</time><p>{item.text}</p></li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="contact" id="contact" aria-labelledby="contact-title">
        <div className="wrap">
          <h2 id="contact-title" className="section-title">{t.contact.title}</h2>
          <p className="contact-body">{t.contact.body}</p>
          <a className="contact-email" href={`mailto:${t.contact.email}`}>{t.contact.email}</a>
          <p className="contact-links">
            {t.contact.links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noreferrer">{l.label}</a>)}
          </p>
          <p className="footer-note">© 2026 {t.hero.name} · 시안 A</p>
        </div>
      </footer>
    </>
  );
}
