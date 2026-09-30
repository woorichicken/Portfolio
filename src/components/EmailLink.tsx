'use client';

import { useState } from 'react';

// 메일 앱이 없는 브라우저에서는 mailto 링크를 눌러도 아무 일도 일어나지 않는다.
// 그래서 주소를 말풍선으로 보여 주고, 누르면 복사까지 한다(mailto 는 그대로 동작한다).
const TIP_VISIBLE_MS = 2500;

type TipState = 'idle' | 'shown' | 'copied';

export default function EmailLink({ href, label, copiedLabel }: { href: string; label: string; copiedLabel: string }) {
  const [tip, setTip] = useState<TipState>('idle');
  const address = href.replace(/^mailto:/, '');

  function onClick() {
    // 터치 화면에는 hover 가 없으니 누르면 주소부터 보여 준다. 복사는 되면 덤이다(권한이 없으면 주소만 보인다).
    setTip('shown');
    navigator.clipboard?.writeText(address).then(() => setTip('copied'), () => {});
    setTimeout(() => setTip('idle'), TIP_VISIBLE_MS);
  }

  return (
    <a className="email-link" href={href} onClick={onClick} aria-describedby="hero-email-tip">
      {label}
      <span className="email-tip" id="hero-email-tip" role="tooltip" data-open={tip === 'idle' ? undefined : ''}>
        {address}
        {tip === 'copied' && <em aria-live="polite"> · {copiedLabel}</em>}
      </span>
    </a>
  );
}
