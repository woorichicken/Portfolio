import Image from 'next/image';
import type { Shot } from '@/content/images';

// 사진 한 장. 누르면 Lightbox 가 크게 보여 준다(openLabel 은 그 동작을 읽어 주는 말).
export default function Figure({ shot, sizes, className, priority, openLabel }: { shot: Shot; sizes: string; className?: string; priority?: boolean; openLabel: string }) {
  return (
    <figure className={className}>
      <a
        className="frame"
        href={shot.src}
        data-lightbox=""
        data-alt={shot.alt}
        data-caption={shot.caption ?? ''}
        aria-label={`${openLabel}: ${shot.alt}`}
      >
        <Image src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} sizes={sizes} priority={priority} />
      </a>
      {shot.caption && <figcaption>{shot.caption}</figcaption>}
    </figure>
  );
}
