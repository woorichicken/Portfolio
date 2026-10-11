import Image from 'next/image';
import type { Artifact } from './labExtras';

export type TileSize = 'big' | 'wide' | 'tall' | 'normal';

// 결과물 벽(/lab/a/design)의 칸 크기 — 6회차 「이 화면도 비대칭」. 사진 비율을 따른다:
// 가로로 긴 화면은 넓은 칸, 세로로 긴 폰·카드는 긴 칸에 넣어야 잘리지 않는다. 영상은 세 편에 한 편꼴로 넓게.
const WIDE_RATIO = 1.9;
const TALL_RATIO = 0.95;
export function tileSize(a: Artifact, index: number): TileSize {
  if (index === 0) return 'big';
  if ('shot' in a) {
    const r = a.shot.width / a.shot.height;
    if (r >= WIDE_RATIO) return 'wide';
    if (r <= TALL_RATIO) return 'tall';
    return 'normal';
  }
  if ('video' in a) return index % 3 === 0 ? 'wide' : 'normal';
  return 'normal';
}

// 결과물 한 칸 — 설명 없이 그림 + 짧은 이름만(5회차 코멘트).
// 사진·영상 포스터는 <a data-lightbox> 라서 사이트의 Lightbox 가 크게 보여 준다. 예시 칸은 점선 자리만.
export function ArtifactTile({ a, projectName, sizes, size }: { a: Artifact; projectName?: string; sizes: string; size?: TileSize }) {
  if ('example' in a) {
    return (
      <figure className="lab-art lab-art-ex" data-kind={a.kind} data-size={size}>
        <div className="lab-art-media"><span>예시</span></div>
        <figcaption><b>{a.title}</b>{projectName && <span>{projectName}</span>}</figcaption>
      </figure>
    );
  }
  const src = 'shot' in a ? a.shot.src : a.video.poster;
  const [w, h] = 'shot' in a ? [a.shot.width, a.shot.height] : [1280, 720];
  const alt = 'shot' in a ? a.shot.alt : `${a.video.title} 영상의 한 장면`;
  return (
    <figure className={`lab-art${'video' in a ? ' is-video' : ''}`} data-kind={a.kind} data-size={size}>
      <a className="lab-art-media" href={src} data-lightbox="" data-alt={alt} data-caption={a.title} aria-label={`크게 보기: ${a.title}`}>
        <Image src={src} alt={alt} width={w} height={h} sizes={sizes} />
        {'video' in a && <span className="lab4-dur">{a.video.duration}</span>}
      </a>
      <figcaption><b>{a.title}</b>{projectName && <span>{projectName}</span>}</figcaption>
    </figure>
  );
}

// 이전 → 이후 사이의 화살표. 가는 「→」 글자는 변화로 읽히지 않는다는 코멘트(5회차 D1·D3)로 굵은 원형 아이콘으로 바꿨다.
// 좁은 화면에서는 CSS 가 아래쪽으로 돌린다.
export function ChangeArrow() {
  return (
    <span className="lab-change" aria-hidden="true">
      <svg viewBox="0 0 32 32" width="32" height="32">
        <circle cx="16" cy="16" r="16" />
        <path d="M9 16h13M17 10.5l5.5 5.5-5.5 5.5" />
      </svg>
    </span>
  );
}
