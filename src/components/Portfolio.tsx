import Image from 'next/image';
import { projectArtifacts, standaloneArtifacts } from '@/content/artifacts';
import { getContent } from '@/content';
import { designPath, projectPath, type Locale } from '@/i18n/config';
import ArtifactTile from './ArtifactTile';
import EmailLink from './EmailLink';
import FeedbackGate from './feedback/FeedbackGate';
import Header from './Header';
import Lightbox from './Lightbox';
import Rich from './Rich';
import PartSlot from './scroll/PartSlot';
import ScrollStage from './scroll/ScrollStage';

// 홈 — 2026-10 디자인 엔지니어 개편(시안 A, 리뷰 7회차까지) + 2026-10-18 채널 색 · 스크롤 그림.
// 첫 화면(내리면 그림이 한 바퀴, 문장 셋) → 소개·숫자 → 프로젝트(크기가 섞인 카드, 이야기는 상세 /projects/<id>)
// → 디자인 엔지니어로서(결과물 미리보기) → 연표 → 연락. 섹션 머리마다 그림의 부품 하나가 확대돼 다시 나온다(PartSlot).
// 그림은 ?fig=bench(검수대, 기본) | recorder(기록계) 로 바꾼다 — 설정은 scroll/figures.ts.
// 「그 외」·「이전」 프로젝트와 수상은 홈에서 뺐다(상세 주소는 그대로 살아 있다 — 리뷰 H4 「빼기」).

// 카드 모양 — 사진 비율에 맞춰 골랐다. PorterX 는 세로 폰 화면, 엔씨디지텍은 아주 가로로 긴 키비주얼이라
// PorterX(두 줄 높이) 옆에 4칸 × 두 줄로 세운다.
const SHAPE: Record<string, 'big' | 'normal' | 'wide' | 'tall' | 'feature'> = {
  kits: 'big', fair: 'normal', 'cli-manager': 'normal', automation: 'wide', purple: 'wide', porterx: 'tall', ncdigitec: 'feature',
};
// 모바일(640 이하) — 2열에 한 줄 꽉(full) · 반 칸(half) · 사진 왼쪽 가로 행(row) · 세로로 긴 칸(tall)을 섞는다
const MOBILE: Record<string, 'full' | 'half' | 'row' | 'tall'> = {
  kits: 'full', fair: 'half', 'cli-manager': 'half', automation: 'row', purple: 'half', porterx: 'tall', ncdigitec: 'half',
};

/** 홈 미리보기에 올릴 결과물 — 첫 칸은 크게 */
const PREVIEW = [
  { project: '', index: 0 },             // 디자인 아틀라스
  { project: 'kits', index: 0 },         // 리뷰 보드
  { project: 'kits', index: 1 },         // 요소 지목 제보 위젯
  { project: 'cli-manager', index: 0 },  // AI 세션은 녹색
  { project: 'ncdigitec', index: 0 },    // 화면 위 수정 피드백
];

export default function Portfolio({ locale }: { locale: Locale }) {
  const t = getContent(locale);
  const preview = PREVIEW.map(({ project, index }) => (project ? projectArtifacts(project, locale) : standaloneArtifacts(locale))[index]).filter(Boolean);

  return (
    <>
      <a className="skip-link" href="#main">{t.a11y.skip}</a>
      <Header locale={locale} t={t} />

      <main id="main" className="home">
        <ScrollStage
          steps={t.hero.steps}
          labelledBy="hero-title"
          head={
            <>
              <p className="stage-role">
                <span lang={locale}>{t.hero.name}</span>
                <span aria-hidden="true" className="stage-sep" />
                {t.hero.role}
              </p>
              <h1 id="hero-title" className="stage-title">
                <span>JEONG</span> <span>(SOLHUN)</span>
                <span className="visually-hidden"> — {t.hero.name}</span>
              </h1>
            </>
          }
          foot={
            <p className="stage-links">
              {t.hero.links.map((l) =>
                l.href.startsWith('mailto:') ? (
                  <EmailLink key={l.href} href={l.href} label={l.label} copiedLabel={t.a11y.copied} />
                ) : (
                  <a key={l.href} href={l.href} target="_blank" rel="noreferrer">{l.label}</a>
                ),
              )}
            </p>
          }
        />

        <section className="wrap intro" aria-label={t.stats.title}>
          <p className="intro-lead"><Rich text={t.hero.lead} /></p>
          <dl className="intro-stats">
            {t.stats.items.map((s) => <div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>)}
          </dl>
        </section>

        <section className="wrap sec" id="work" aria-labelledby="work-title">
          <header className="sec-head">
            <PartSlot section="work" />
            <div className="sec-head-text">
              <h2 id="work-title">{t.work.title}</h2>
              <p>{t.work.intro}</p>
            </div>
          </header>
          <ul className="bento">
            {t.work.projects.map((p) => {
              const chips = p.improvements?.map((i) => i.title) ?? [];
              const shape = SHAPE[p.id] ?? 'normal';
              // 세로로 긴 사진은 넓은 칸에서 잘리면 글자가 반쯤 보인다 — 긴 칸이 아니면 통째로 담는다
              const portrait = p.cover.height > p.cover.width && shape !== 'tall';
              return (
                // id 는 예전 홈의 「#kits」 같은 주소가 그 카드로 오게 남긴다
                <li key={p.id} id={p.id} className={`is-${shape} m-${MOBILE[p.id] ?? 'half'}`}>
                  <a className="bento-card" href={projectPath(locale, p.id)}>
                    <div className={`card-cover${portrait ? ' is-portrait' : ''}`}>
                      <Image className="photo" src={p.cover.src} alt={p.cover.alt} width={p.cover.width} height={p.cover.height} sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 60vw" priority={shape === 'big'} />
                    </div>
                    <div className="bento-text">
                      <p className="card-ctx">{p.context}</p>
                      <h3>{p.name}<span aria-hidden="true">→</span></h3>
                      <p className="card-tag">{p.tagline}</p>
                      {chips.length > 0 && <ul className="chips">{chips.slice(0, 4).map((c) => <li key={c}>{c}</li>)}</ul>}
                      <p className="card-meta">{p.facts[1]?.value} · {p.facts[0]?.value}</p>
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="wrap sec" id="design" aria-labelledby="design-title">
          <header className="sec-head">
            <PartSlot section="design" />
            <div className="sec-head-text">
              <h2 id="design-title">{t.design.title}</h2>
              <a className="sec-more" href={designPath(locale)}>{t.design.more}</a>
            </div>
          </header>
          <div className="art-preview">
            {preview.map((a) => (
              <ArtifactTile key={a.title} a={a} sizes="(max-width: 700px) 100vw, 30vw" exampleLabel={t.design.example} openLabel={t.a11y.openImage} />
            ))}
          </div>
        </section>

        <section className="wrap sec timeline" id="timeline" aria-labelledby="timeline-title">
          <header className="sec-head">
            <PartSlot section="timeline" />
            <div className="sec-head-text"><h2 id="timeline-title">{t.timeline.title}</h2></div>
          </header>
          <ol className="tl-cols">
            {t.timeline.items.slice().reverse().map((item) => (
              <li key={item.date}><time>{item.date}</time><p>{item.text}</p></li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="contact contact-home" id="contact" aria-labelledby="contact-title">
        <div className="wrap">
          <h2 id="contact-title" className="visually-hidden">{t.contact.title}</h2>
          <p className="contact-body">{t.contact.body}</p>
          <a className="contact-email" href={`mailto:${t.contact.email}`}>{t.contact.email}</a>
          <p className="contact-links">
            {t.contact.links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noreferrer">{l.label}</a>)}
          </p>
          <p className="footer-note">© 2026 {t.hero.name} · {t.footer.note}</p>
        </div>
      </footer>

      <Lightbox closeLabel={t.a11y.closeImage} prevLabel={t.a11y.prevImage} nextLabel={t.a11y.nextImage} />
      <FeedbackGate copy={t.feedback} />
    </>
  );
}
