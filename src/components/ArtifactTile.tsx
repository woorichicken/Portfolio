import Image from 'next/image';
import type { Artifact } from '@/content/artifacts';

export type TileSize = 'big' | 'wide' | 'tall' | 'normal';

// 결과물 화면(/design)의 칸 크기 — 사진 비율을 따른다. 가로로 긴 화면은 넓은 칸, 세로로 긴 화면은 긴 칸에 넣어야 잘리지 않는다.
const WIDE_RATIO = 1.9;
const TALL_RATIO = 0.95;
export function tileSize(a: Artifact, index: number): TileSize {
  if (index === 0) return 'big';
  if ('shot' in a) {
    const r = a.shot.width / a.shot.height;
    if (r >= WIDE_RATIO) return 'wide';
    if (r <= TALL_RATIO) return 'tall';
  }
  return 'normal';
}

// 결과물 한 칸 — 설명 없이 그림 + 짧은 이름만. 사진은 <a data-lightbox> 라서 Lightbox 가 크게 보여 준다.
// 예시 칸(자료가 아직 없는 자리)은 data-example 로 표시해 두고 CSS 가 피드백 모드에서만 보여 준다.
export default function ArtifactTile({ a, sizes, projectName, size, exampleLabel, openLabel }: {
  a: Artifact;
  sizes: string;
  projectName?: string;
  size?: TileSize;
  exampleLabel: string;
  openLabel: string;
}) {
  if ('example' in a) {
    return (
      <figure className="art art-ex" data-kind={a.kind} data-size={size} data-example="">
        <div className="art-media"><span>{exampleLabel}</span></div>
        <figcaption><b>{a.title}</b>{projectName && <span>{projectName}</span>}</figcaption>
      </figure>
    );
  }
  return (
    <figure className="art" data-kind={a.kind} data-size={size}>
      <a className="art-media" href={a.shot.src} data-lightbox="" data-alt={a.shot.alt} data-caption={a.title} aria-label={`${openLabel}: ${a.title}`}>
        <Image src={a.shot.src} alt={a.shot.alt} width={a.shot.width} height={a.shot.height} sizes={sizes} />
      </a>
      <figcaption><b>{a.title}</b>{projectName && <span>{projectName}</span>}</figcaption>
    </figure>
  );
}

// 이전 → 이후 사이의 화살표. 가는 「→」 글자는 변화로 읽히지 않는다는 리뷰로 굵은 원형 아이콘을 쓴다.
// 좁은 화면에서는 CSS 가 아래쪽으로 돌린다.
export function ChangeArrow() {
  return (
    <span className="ba-arrow" aria-hidden="true">
      <svg viewBox="0 0 32 32" width="32" height="32">
        <circle cx="16" cy="16" r="16" />
        <path d="M9 16h13M17 10.5l5.5 5.5-5.5 5.5" />
      </svg>
    </span>
  );
}
