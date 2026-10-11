import { projectArtifacts, standaloneArtifacts, type Artifact } from '@/content/artifacts';
import { getContent } from '@/content';
import type { ArtifactKind } from '@/content/types';
import { designPath, localePath, type Locale } from '@/i18n/config';
import ArtifactTile, { tileSize } from './ArtifactTile';
import FeedbackGate from './feedback/FeedbackGate';
import Header from './Header';
import KindFilter from './KindFilter';
import Lightbox from './Lightbox';

// 「디자인 엔지니어로서」 결과물 화면(/design). 설명 없이 결과물만 — 프로젝트 순서대로 모으고 종류로 거른다.
// 칸 크기는 사진 비율대로 섞는다(넓은 화면은 넓은 칸, 세로로 긴 화면은 긴 칸).

export default function DesignWall({ locale }: { locale: Locale }) {
  const t = getContent(locale);
  const all: { a: Artifact; project?: string }[] = [
    ...standaloneArtifacts(locale).map((a) => ({ a })),
    ...t.work.projects.flatMap((p) => projectArtifacts(p.id, locale).map((a) => ({ a, project: p.name }))),
  ];
  // 숫자와 거르기 칩은 일반 방문자가 보는 것(예시 칸 제외)만 센다
  const visible = all.filter(({ a }) => !('example' in a));
  const kinds = (Object.keys(t.design.kinds) as ArtifactKind[]).filter((k) => visible.some(({ a }) => a.kind === k));

  return (
    <>
      <a className="skip-link" href="#main">{t.a11y.skip}</a>
      <Header locale={locale} t={t} altPath={designPath} />
      <main id="main" className="lab lab4-case">
        <header className="lab4-case-head">
          <div className="wrap">
            <a className="detail-back" href={`${localePath(locale)}#design`}>{t.design.back}</a>
            <div className="lab4-case-title">
              <div>
                <p className="pill">{t.design.title}</p>
                <h1 className="project-name">{t.design.pageTitle}</h1>
              </div>
              <dl className="lab4-case-facts">
                {kinds.map((k) => <div key={k}><dt>{t.design.kinds[k]}</dt><dd>{visible.filter(({ a }) => a.kind === k).length}</dd></div>)}
              </dl>
            </div>
          </div>
        </header>
        <div className="wrap lab5-design">
          <KindFilter kinds={kinds.map((k) => ({ key: k, label: t.design.kinds[k] }))} allLabel={t.design.all} label={t.design.filter}>
            <div className="lab6-wall">
              {all.map(({ a, project }, i) => (
                <ArtifactTile key={`${project ?? ''}-${a.title}`} a={a} projectName={project} size={tileSize(a, i)} sizes="(max-width: 700px) 100vw, 50vw" exampleLabel={t.design.example} openLabel={t.a11y.openImage} />
              ))}
            </div>
          </KindFilter>
          <p className="lab5-note" data-example="">{t.design.note}</p>
        </div>
      </main>
      <footer className="contact contact-compact">
        <div className="wrap">
          <a className="contact-email" href={`mailto:${t.contact.email}`}>{t.contact.email}</a>
          <p className="footer-note">© 2026 {t.hero.name} · {t.footer.note}</p>
        </div>
      </footer>
      <Lightbox closeLabel={t.a11y.closeImage} prevLabel={t.a11y.prevImage} nextLabel={t.a11y.nextImage} />
      <FeedbackGate copy={t.feedback} />
    </>
  );
}
