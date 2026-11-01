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

/** 프로젝트 카드 — 그림 + 작은 줄(맥락·기간) + 이름. 누르면 상세(/projects/<slug>) */
export function TitleCard({ card, locale, sizes, priority, tag }: { card: TitleCardData; locale: Locale; sizes: string; priority?: boolean; tag?: string }) {
  const portrait = card.shot.height > card.shot.width;
  return (
    <a className="card" href={projectPath(locale, card.slug)}>
      <span className={`card-media${portrait ? ' is-portrait' : ''}`}>
        <Image src={card.shot.src} alt={card.shot.alt} width={card.shot.width} height={card.shot.height} sizes={sizes} priority={priority} />
        {tag && <span className="card-tag">{tag}</span>}
      </span>
      <span className="card-kicker">{card.kicker}</span>
      <span className="card-name">{card.name}</span>
    </a>
  );
}

/** 결과물 카드 — 그림을 누르면 크게(Lightbox). 「예시」 칸은 피드백 모드에서만 보인다 */
export function ArtifactTileCard({ item, sizes, exampleLabel, openLabel }: { item: ArtifactCard; sizes: string; exampleLabel: string; openLabel: string }) {
  const a = item.artifact;
  if ('example' in a) {
    return (
      <figure className="art art-ex" data-kind={a.kind} data-example="">
        <div className="art-media"><span>{exampleLabel}</span></div>
        <figcaption><b>{a.title}</b>{item.projectName && <span>{item.projectName}</span>}</figcaption>
      </figure>
    );
  }
  return (
    <figure className="art" data-kind={a.kind}>
      <a className="art-media" href={a.shot.src} data-lightbox="" data-alt={a.shot.alt} data-caption={item.projectName ? `${a.title} · ${item.projectName}` : a.title} aria-label={`${openLabel}: ${a.title}`}>
        <Image src={a.shot.src} alt={a.shot.alt} width={a.shot.width} height={a.shot.height} sizes={sizes} />
      </a>
      <figcaption><b>{a.title}</b>{item.projectName && <span>{item.projectName}</span>}</figcaption>
    </figure>
  );
}
