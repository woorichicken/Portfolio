import Image from 'next/image';
import type { ReactNode } from 'react';
import type { ArtifactCard, TitleCard as TitleCardData } from '@/content/screen-data';
import { projectPath, type Locale } from '@/i18n/config';
import RowTrack from './RowTrack';

// 행 하나와 그 안의 카드들. 서버에서 다 그리고, 넘기는 화살표만 클라이언트(RowTrack)다.

export function Row({ id, title, more, size, prevLabel, nextLabel, children }: {
  id: string;
  title: string;
  more?: { href: string; label: string };
  size: 'lg' | 'md' | 'sm';
  prevLabel: string;
  nextLabel: string;
  children: ReactNode;
}) {
  const headingId = `${id}-title`;
  return (
    <section className="row" data-size={size} id={id} aria-labelledby={headingId}>
      <div className="row-head">
        <h2 className="row-title" id={headingId}>{title}</h2>
        {more && <a className="row-more" href={more.href}>{more.label} ›</a>}
      </div>
      <RowTrack prevLabel={prevLabel} nextLabel={nextLabel} labelledBy={headingId}>{children}</RowTrack>
    </section>
  );
}

/** 프로젝트 카드 — 16:9 그림 위에 맥락·이름을 얹는다. 누르면 상세(/projects/<slug>)
 *  그림 설명(alt)은 비운다 — 링크 이름이 「맥락 · 이름」으로 읽혀야 화면 읽기 프로그램이 카드마다 긴 그림 설명을 되풀이하지 않는다. */
export function TitleCard({ card, locale, sizes, priority, tag }: { card: TitleCardData; locale: Locale; sizes: string; priority?: boolean; tag?: string }) {
  const portrait = card.shot.height > card.shot.width;
  return (
    <a className="card" href={projectPath(locale, card.slug)}>
      <span className={`card-media${portrait ? ' is-portrait' : ''}`}>
        <Image src={card.shot.src} alt="" width={card.shot.width} height={card.shot.height} sizes={sizes} priority={priority} />
        {tag && <span className="card-tag">{tag}</span>}
        <span className="card-label">
          <span className="card-kicker">{card.kicker}</span>
          <span className="card-name">{card.name}</span>
        </span>
      </span>
    </a>
  );
}

/** 결과물 카드 — 같은 16:9 카드. 누르면 크게(Lightbox). 「예시」 칸은 피드백 모드에서만 보인다 */
export function ArtifactTileCard({ item, sizes, exampleLabel, openLabel }: { item: ArtifactCard; sizes: string; exampleLabel: string; openLabel: string }) {
  const a = item.artifact;
  if ('example' in a) {
    return (
      <div className="card art-ex" data-kind={a.kind} data-example="">
        <span className="card-media"><span>{exampleLabel}</span></span>
      </div>
    );
  }
  return (
    <a
      className="card art-media"
      data-kind={a.kind}
      href={a.shot.src}
      data-lightbox=""
      data-alt={a.shot.alt}
      data-caption={item.projectName ? `${a.title} · ${item.projectName}` : a.title}
      aria-label={`${openLabel}: ${a.title}${item.projectName ? ` · ${item.projectName}` : ''}`}
    >
      <span className="card-media">
        <Image src={a.shot.src} alt="" width={a.shot.width} height={a.shot.height} sizes={sizes} />
        <span className="card-label">
          {item.projectName && <span className="card-kicker">{item.projectName}</span>}
          <span className="card-name">{a.title}</span>
        </span>
      </span>
    </a>
  );
}

/** 비슷한 작품 카드 — 넷플릭스 「함께 시청된 콘텐츠」처럼 그림 아래 회색 칸에 글 */
export function SimilarCard({ card, locale, sizes }: { card: TitleCardData; locale: Locale; sizes: string }) {
  return (
    <a className="sim" href={projectPath(locale, card.slug)}>
      <span className="sim-media"><Image src={card.shot.src} alt="" width={card.shot.width} height={card.shot.height} sizes={sizes} /></span>
      <span className="sim-body">
        <span className="sim-kicker">{card.kicker}</span>
        <span className="sim-name">{card.name}</span>
      </span>
    </a>
  );
}
