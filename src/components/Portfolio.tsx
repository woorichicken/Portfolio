import Image from 'next/image';
import { getContent } from '@/content';
import type { Project } from '@/content/types';
import { projectPath, type Locale } from '@/i18n/config';
import EmailLink from './EmailLink';
import FeedbackGate from './feedback/FeedbackGate';
import Figure from './Figure';
import Header from './Header';
import Lightbox from './Lightbox';
import Rich from './Rich';
import { Icosahedron, RingSphere } from './Wireframes';

// 페이지 전체. 서버 컴포넌트라 언어별 HTML 이 빌드 때 완성된다 — 클라이언트 JS 는 피드백 관문뿐이다.

function FactTable({ facts }: { facts: Project['facts'] }) {
  return (
    <dl className="facts">
      {facts.map((f) => (
        <div key={f.label}>
          <dt>{f.label}</dt>
          <dd>{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ProjectArticle({ project, labels, index, openLabel }: { project: Project; labels: { before: string; after: string; lesson: string; results: string }; index: number; openLabel: string }) {
  const tallCover = project.cover.height > project.cover.width;
  return (
    <article className="project" id={project.id} aria-labelledby={`${project.id}-title`}>
      <header className="project-head">
        <p className="pill">{project.context}</p>
        <h3 id={`${project.id}-title`} className="project-name">{project.name}</h3>
        <p className="project-tagline">{project.tagline}</p>
        <FactTable facts={project.facts} />
        {project.links && (
          <p className="project-links">
            {project.links.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer">{l.label}</a>
            ))}
          </p>
        )}
      </header>

      <div className="project-body">
        <Figure
          shot={project.cover}
          className={tallCover ? 'cover cover-tall' : 'cover'}
          sizes="(max-width: 900px) 100vw, 62vw"
          priority={index === 0}
          openLabel={openLabel}
        />
        <p className="project-summary"><Rich text={project.summary} /></p>

        {project.improvements && (
          <ol className="improvements">
            {project.improvements.map((item) => (
              <li key={item.title}>
                {item.badge && <p className="improvement-badge">{item.badge}</p>}
                <h4>{item.title}</h4>
                <dl className="before-after">
                  <div><dt>{labels.before}</dt><dd>{item.before}</dd></div>
                  <div><dt>{labels.after}</dt><dd><Rich text={item.after} /></dd></div>
                </dl>
                {item.metric && (
                  <p className="inline-metric"><strong>{item.metric.value}</strong> {item.metric.label}</p>
                )}
              </li>
            ))}
          </ol>
        )}

        {project.metrics && (
          <section className="results" aria-label={labels.results}>
            {project.metrics.map((m) => (
              <p key={m.label}><strong>{m.value}</strong><span>{m.label}</span></p>
            ))}
          </section>
        )}

        {project.quotes && (
          <div className="quotes">
            {project.quotes.map((q) => (
              <blockquote key={q.text}>
                <p>{q.text}</p>
                <footer>{q.who}</footer>
              </blockquote>
            ))}
          </div>
        )}

        {project.gallery && (
          <div className="gallery">
            {project.gallery.map((s) => (
              <Figure key={s.src} shot={s} className={s.height > s.width ? 'tall' : undefined} sizes="(max-width: 700px) 100vw, 31vw" openLabel={openLabel} />
            ))}
          </div>
        )}

        {project.lesson && (
          <aside className="lesson">
            <h4>{labels.lesson} — {project.lesson.title}</h4>
            <p><Rich text={project.lesson.body} /></p>
          </aside>
        )}
      </div>
    </article>
  );
}

export default function Portfolio({ locale }: { locale: Locale }) {
  const t = getContent(locale);
  return (
    <>
      <a className="skip-link" href="#main">{t.a11y.skip}</a>
      <Header locale={locale} t={t} />

      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-glow" aria-hidden="true" />
          <Icosahedron className="hero-wire hero-wire-a" />
          <RingSphere className="hero-wire hero-wire-b" />
          <div className="hero-inner">
            <h1 id="hero-title" className="hero-title">
              <span className="hero-mark">JEONG</span> <span className="hero-mark">(SOLHUN)</span>
              <span className="visually-hidden"> — {t.hero.name}</span>
            </h1>
            <p className="hero-role">
              <span lang={locale}>{t.hero.name}</span>
              <span aria-hidden="true" className="hero-sep" />
              {t.hero.role}
            </p>
            <p className="hero-lead"><Rich text={t.hero.lead} /></p>
            <ul className="hero-keywords">
              {t.hero.keywords.map((k) => (
                <li key={k.title}>
                  <h2>{k.title}</h2>
                  <p>{k.body}</p>
                </li>
              ))}
            </ul>
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

        <section className="stats wrap" aria-labelledby="stats-title">
          <h2 id="stats-title" className="visually-hidden">{t.stats.title}</h2>
          {t.stats.items.map((s) => (
            <p key={s.label}><strong>{s.value}</strong><span>{s.label}</span></p>
          ))}
        </section>

        <section className="work wrap" id="work" aria-labelledby="work-title">
          <h2 id="work-title" className="section-title">{t.work.title}</h2>
          <p className="section-intro">{t.work.intro}</p>
          {t.work.projects.map((p, i) => (
            <ProjectArticle key={p.id} project={p} labels={t.work.labels} index={i} openLabel={t.a11y.openImage} />
          ))}
        </section>

        <section className="others wrap" aria-labelledby="others-title">
          <h2 id="others-title" className="section-title">{t.others.title}</h2>
          <p className="section-intro">{t.others.intro}</p>
          <ul className="others-grid">
            {t.others.items.map((o) => (
              <li key={o.slug}>
                {/* 사진은 상세로 가는 같은 링크의 반복이라 읽어 주지 않는다 */}
                <a className="thumb" href={projectPath(locale, o.slug)} tabIndex={-1} aria-hidden="true">
                  <Image src={o.shot.src} alt="" width={o.shot.width} height={o.shot.height} sizes="(max-width: 700px) 100vw, 30vw" />
                </a>
                <h3><a href={projectPath(locale, o.slug)}>{o.name}</a></h3>
                <p className="meta">{o.period}</p>
                <p><Rich text={o.body} /></p>
                <a className="more-link" href={projectPath(locale, o.slug)} aria-label={`${o.name} — ${t.detail.more}`}>{t.detail.more} →</a>
              </li>
            ))}
          </ul>
          <div className="contests">
            <h3>{t.others.contestsTitle}</h3>
            <p>{t.others.contests}</p>
          </div>
        </section>

        <section className="early wrap" aria-labelledby="early-title">
          <h2 id="early-title" className="section-title">{t.early.title}</h2>
          <p className="section-intro">{t.early.intro}</p>
          <div className="early-grid">
            {t.early.items.map((e) => (
              <article key={e.slug} className="early-item">
                <Figure shot={e.shot} sizes="(max-width: 900px) 100vw, 32vw" openLabel={t.a11y.openImage} />
                <p className="pill pill-quiet">{e.tag}</p>
                <h3><a href={projectPath(locale, e.slug)}>{e.name}</a></h3>
                <p><Rich text={e.body} /></p>
                {e.metrics && (
                  <p className="early-metrics">
                    {e.metrics.map((m) => <span key={m.label}><strong>{m.value}</strong> {m.label}</span>)}
                    {e.note && <small>{e.note}</small>}
                  </p>
                )}
                <a className="more-link" href={projectPath(locale, e.slug)} aria-label={`${e.name} — ${t.detail.more}`}>{t.detail.more} →</a>
              </article>
            ))}
          </div>
          <article className="devhoon">
            <div>
              <p className="pill pill-quiet">{t.early.devhoon.tag}</p>
              <h3>{t.early.devhoon.name}</h3>
              <p>{t.early.devhoon.body}</p>
              <ol className="mini-timeline">
                {t.early.devhoon.history.map((h) => (
                  <li key={h.text}><time>{h.date}</time><span>{h.text}</span></li>
                ))}
              </ol>
            </div>
            <div className="devhoon-shots">
              {t.early.devhoon.shots.map((s) => <Figure key={s.src} shot={s} sizes="(max-width: 900px) 100vw, 30vw" openLabel={t.a11y.openImage} />)}
            </div>
          </article>
        </section>

        <section className="timeline wrap" id="timeline" aria-labelledby="timeline-title">
          <h2 id="timeline-title" className="section-title">{t.timeline.title}</h2>
          <ol>
            {t.timeline.items.map((item) => (
              <li key={item.date}><time>{item.date}</time><p>{item.text}</p></li>
            ))}
          </ol>
        </section>

        <section className="awards wrap" aria-labelledby="awards-title">
          <h2 id="awards-title" className="section-title">{t.awards.title}</h2>
          <ul>
            {t.awards.items.map((a) => (
              <li key={a.title}>
                <time>{a.date}</time>
                <div>
                  <h3>{a.title}</h3>
                  <p className="meta">{a.org}</p>
                  <p>{a.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="contact" id="contact" aria-labelledby="contact-title">
        <div className="wrap">
          <h2 id="contact-title" className="section-title">{t.contact.title}</h2>
          <p className="contact-body">{t.contact.body}</p>
          <a className="contact-email" href={`mailto:${t.contact.email}`}>{t.contact.email}</a>
          <p className="contact-links">
            {t.contact.links.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer">{l.label}</a>
            ))}
          </p>
          <p className="contact-closing">{t.contact.closing}</p>
          <p className="footer-note">© 2026 {t.hero.name} · {t.footer.note}</p>
        </div>
      </footer>

      <Lightbox closeLabel={t.a11y.closeImage} prevLabel={t.a11y.prevImage} nextLabel={t.a11y.nextImage} />
      <FeedbackGate copy={t.feedback} />
    </>
  );
}
