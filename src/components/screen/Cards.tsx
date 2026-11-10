import Image from 'next/image';
import type { ReactNode } from 'react';
import type { ArtifactCard, TitleCard as TitleCardData, VideoCard as VideoCardData } from '@/content/screen-data';
import type { OpenSourceRepo } from '@/content/types';
import { projectPath, type Locale } from '@/i18n/config';
import RowTrack from './RowTrack';
import { IconCode, IconExternal } from './icons';
import { isMediaSrc } from '@/content/images';

// 행 하나와 그 안의 카드들. 서버에서 다 그리고, 넘기는 화살표만 클라이언트(RowTrack)다.

export function Row({ id, title, size, kind, prevLabel, nextLabel, children }: {
  id: string;
  title: string;
  size: 'lg' | 'md' | 'sm';
  /** 카드 모양이 다른 행(오픈소스 · 영상) — 한 줄에 몇 장 놓을지가 달라진다(globals.css .row[data-kind]) */
  kind?: 'oss' | 'video';
  prevLabel: string;
  nextLabel: string;
  children: ReactNode;
}) {
  const headingId = `${id}-title`;
  return (
    <section className="row" data-size={size} data-kind={kind} id={id} aria-labelledby={headingId}>
      <div className="row-head">
        <h2 className="row-title" id={headingId}>{title}</h2>
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
        <Image src={card.shot.src} unoptimized={isMediaSrc(card.shot.src)} alt="" width={card.shot.width} height={card.shot.height} sizes={sizes} priority={priority} />
        {tag && <span className="card-tag">{tag}</span>}
        <span className="card-label">
          <span className="card-kicker">{card.kicker}</span>
          <span className="card-name">{card.name}</span>
        </span>
      </span>
    </a>
  );
}

/** 결과물 카드 — 같은 16:9 카드. 누르면 크게(Lightbox) */
export function ArtifactTileCard({ item, sizes, openLabel }: { item: ArtifactCard; sizes: string; openLabel: string }) {
  const a = item.artifact;
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
        <Image src={a.shot.src} unoptimized={isMediaSrc(a.shot.src)} alt="" width={a.shot.width} height={a.shot.height} sizes={sizes} />
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
      <span className="sim-media"><Image src={card.shot.src} unoptimized={isMediaSrc(card.shot.src)} alt="" width={card.shot.width} height={card.shot.height} sizes={sizes} /></span>
      <span className="sim-body">
        <span className="sim-kicker">{card.kicker}</span>
        <span className="sim-name">{card.name}</span>
      </span>
    </a>
  );
}

/**
 * 오픈소스 카드 — 그림 없이 이름 · 한 줄 · 링크. 저장소에는 대표 그림이 없어서 16:9 카드 대신 글 카드로 둔다.
 * 카드 전체를 링크 하나로 감싸지 않는다 — 「코드 보기」와 「사이트」 두 곳으로 나가야 해서(링크 안에 링크를 넣을 수 없다).
 */
export function OpenSourceCard({ item, codeLabel, siteLabel, newTab }: { item: OpenSourceRepo; codeLabel: string; siteLabel: string; newTab: string }) {
  const path = item.repo.replace(/^https:\/\/(www\.)?/, '');
  return (
    <article className="oss" aria-labelledby={`oss-${item.id}`}>
      <p className="oss-path">{path}</p>
      <h3 className="oss-name" id={`oss-${item.id}`}>{item.name}</h3>
      <p className="oss-body">{item.body}</p>
      <div className="oss-actions">
        <a className="btn btn-ghost btn-sm" href={item.repo} target="_blank" rel="noreferrer"><IconCode />{codeLabel}<span className="visually-hidden"> — {item.name} {newTab}</span></a>
        {item.homepage && <a className="btn btn-outline btn-sm" href={item.homepage} target="_blank" rel="noreferrer"><IconExternal />{siteLabel}<span className="visually-hidden"> — {item.name} {newTab}</span></a>}
      </div>
    </article>
  );
}

/**
 * 영상 카드 — 누르기 전에는 대표 장면(포스터)만 받는다(preload="none"). 자동재생하지 않는다 — 방문자가 고른 때에만 소리·데이터를 쓴다.
 * 영상은 R2(/media/…)에서 오고, Range 요청(206)을 받아 앞뒤로 넘길 수 있다(src/app/media).
 */
export function VideoCard({ card, locale, projectLabel }: { card: VideoCardData; locale: Locale; projectLabel: string }) {
  const v = card.video;
  return (
    <figure className="vid" aria-labelledby={`vid-${v.id}`}>
      <div className="vid-media">
        <video controls preload="none" playsInline poster={v.poster} width={v.width} height={v.height} aria-labelledby={`vid-${v.id}`}>
          <source src={v.src} type={v.src.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
        </video>
      </div>
      <figcaption className="vid-body">
        <span className="vid-title" id={`vid-${v.id}`}>{v.title}</span>
        <span className="vid-text">{v.body}</span>
        {card.projectName && card.projectSlug && (
          <a className="vid-project" href={projectPath(locale, card.projectSlug)}>{projectLabel} · {card.projectName}</a>
        )}
      </figcaption>
    </figure>
  );
}
