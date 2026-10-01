import type { WorkEntry } from '@/content';
import { getContent } from '@/content';
import { localePath, type Locale } from '@/i18n/config';
import FeedbackGate from './feedback/FeedbackGate';
import Figure from './Figure';
import Header from './Header';
import Lightbox from './Lightbox';
import Rich from './Rich';

// 「그 외」·「이전」 프로젝트의 상세 페이지. 홈 카드의 한 줄 요약에 기간·역할·배경을 더해 보여 준다.
export default function WorkDetail({ locale, entry }: { locale: Locale; entry: WorkEntry }) {
  const t = getContent(locale);
  return (
    <>
      <a className="skip-link" href="#main">{t.a11y.skip}</a>
      <Header locale={locale} t={t} detailSlug={entry.slug} />

      <main id="main" className="detail wrap">
        <a className="detail-back" href={`${localePath(locale)}#work`}>← {t.detail.back}</a>
        <p className="pill pill-quiet">{entry.meta}</p>
        <h1 className="project-name">{entry.name}</h1>
        <p className="project-summary"><Rich text={entry.body} /></p>

        <div className="detail-grid">
          <div>
            <dl className="facts">
              {entry.detail.facts.map((f) => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
            {entry.detail.links && (
              <p className="project-links">
                {entry.detail.links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noreferrer">{l.label}</a>
                ))}
              </p>
            )}
          </div>
          <div>
            <Figure
              shot={entry.shot}
              className={entry.shot.height > entry.shot.width ? 'cover cover-tall' : 'cover'}
              sizes="(max-width: 900px) 100vw, 62vw"
              priority
              openLabel={t.a11y.openImage}
            />
            {entry.detail.paragraphs.map((p) => (
              <p key={p} className="detail-paragraph"><Rich text={p} /></p>
            ))}
          </div>
        </div>
      </main>

      <footer className="contact contact-compact">
        <div className="wrap">
          <a className="detail-back" href={`${localePath(locale)}#work`}>← {t.detail.back}</a>
          <p className="footer-note">© 2026 {t.hero.name} · {t.footer.note}</p>
        </div>
      </footer>

      <Lightbox closeLabel={t.a11y.closeImage} prevLabel={t.a11y.prevImage} nextLabel={t.a11y.nextImage} />
      <FeedbackGate copy={t.feedback} />
    </>
  );
}
