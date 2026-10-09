/* eslint-disable @next/next/no-html-link-for-pages -- 시안끼리는 전체 새로고침 이동이 맞다: 화면마다 처음 그려지는 모습을 리뷰한다 */
import Header from '@/components/Header';
import Lightbox from '@/components/Lightbox';
import { ArtifactTile } from '@/components/lab/LabArtifact';
import { KindFilter } from '@/components/lab/LabClient';
import { getLabProjects } from '@/components/lab/labData';
import { ARTIFACTS, STANDALONE } from '@/components/lab/labExtras';
import { getContent } from '@/content';

// 「디자인 엔지니어로서」 별도 화면(5회차 H2). 설명 없이 결과물만 — 영상·도구·시스템·화면을 한곳에 모으고 종류로 거른다.
// 프로젝트 순서대로 묶어, 카드 아래 작은 글씨로 어느 프로젝트의 것인지 붙인다.

export default function LabADesign() {
  const t = getContent('ko');
  const projects = getLabProjects();
  const all = [
    ...STANDALONE.map((a) => ({ a, project: undefined as string | undefined })),
    ...projects.flatMap((p) => (ARTIFACTS[p.id] ?? []).map((a) => ({ a, project: p.name }))),
  ];
  const kinds = [...new Set(all.map(({ a }) => a.kind))];
  const counts = Object.fromEntries(kinds.map((k) => [k, all.filter(({ a }) => a.kind === k && !('example' in a)).length]));

  return (
    <>
      <Header locale="ko" t={t} />
      <main id="main" className="lab lab4-case">
        <header className="lab4-case-head">
          <div className="wrap">
            <a className="detail-back" href="/lab/a#design">← 홈으로</a>
            <div className="lab4-case-title">
              <div>
                <p className="pill">디자인 엔지니어로서</p>
                <h1 className="project-name">화면·영상·제품을 코드로</h1>
              </div>
              <dl className="lab4-case-facts">
                {kinds.map((k) => <div key={k}><dt>{k}</dt><dd>{counts[k]}</dd></div>)}
              </dl>
            </div>
          </div>
        </header>
        <div className="wrap lab5-design">
          <KindFilter kinds={kinds}>
            <div className="lab5-wall">
              {all.map(({ a, project }) => <ArtifactTile key={`${project}-${a.title}`} a={a} projectName={project} sizes="(max-width: 700px) 100vw, 25vw" />)}
            </div>
          </KindFilter>
          <p className="lab5-note">점선 칸은 아직 자료가 없는 자리입니다. · 영상은 공개 전 권리 확인이 필요합니다.</p>
        </div>
      </main>
      <footer className="contact contact-compact">
        <div className="wrap">
          <a className="contact-email" href={`mailto:${t.contact.email}`}>{t.contact.email}</a>
          <p className="footer-note">© 2026 {t.hero.name} · 시안 A 5회차</p>
        </div>
      </footer>
      <Lightbox closeLabel={t.a11y.closeImage} prevLabel={t.a11y.prevImage} nextLabel={t.a11y.nextImage} />
    </>
  );
}
