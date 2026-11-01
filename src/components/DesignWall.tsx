import { projectArtifacts, standaloneArtifacts } from '@/content/artifacts';
import { getContent } from '@/content';
import type { ArtifactCard } from '@/content/screen-data';
import type { ArtifactKind } from '@/content/types';
import { designPath, projectPath, type Locale } from '@/i18n/config';
import KindFilter from './KindFilter';
import { ArtifactTileCard } from './screen/Cards';
import Shell from './screen/Shell';

// 결과물 화면(/design) — 모바일 아래 탭의 「결과물」. 설명 없이 그림과 짧은 이름만, 종류로 거른다.
// 프로젝트에 묶인 결과물은 이름 아래 프로젝트 이름을 달아 어느 일에서 나왔는지 보이게 한다.

export default function DesignWall({ locale }: { locale: Locale }) {
  const t = getContent(locale);
  const all: ArtifactCard[] = [
    ...standaloneArtifacts(locale).map((artifact) => ({ artifact })),
    ...t.work.projects.flatMap((p) => projectArtifacts(p.id, locale).map((artifact) => ({ artifact, projectName: p.name, projectSlug: p.id }))),
  ];
  // 거르기 칩은 일반 방문자가 보는 것(예시 칸 제외)만 센다
  const visible = all.filter(({ artifact }) => !('example' in artifact));
  const kinds = (Object.keys(t.design.kinds) as ArtifactKind[]).filter((k) => visible.some(({ artifact }) => artifact.kind === k));

  return (
    <Shell locale={locale} altPath={designPath} tab="work">
      <div className="wrap wall-head">
        <p className="wall-kicker">{t.design.title}</p>
        <h1 className="wall-title">{t.design.pageTitle}</h1>
        <p className="wall-note">{t.design.note}</p>
      </div>
      <div className="wrap">
        <KindFilter kinds={kinds.map((k) => ({ key: k, label: t.design.kinds[k] }))} allLabel={t.design.all} label={t.design.filter}>
          <ul className="wall">
            {all.map((item) => (
              <li key={`${item.projectSlug ?? ''}-${item.artifact.title}`} data-kind={item.artifact.kind} {...('example' in item.artifact ? { 'data-example': '' } : {})}>
                <ArtifactTileCard item={item} sizes="(max-width: 640px) 100vw, 320px" exampleLabel={t.design.example} openLabel={t.a11y.openImage} />
                {item.projectSlug && <a className="row-more" href={projectPath(locale, item.projectSlug)}>{t.detail.more} ›</a>}
              </li>
            ))}
          </ul>
        </KindFilter>
      </div>
    </Shell>
  );
}
