import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Avatar } from '../icons';

// 빌보드 머리의 작은 정사각 아이콘 — 프로젝트에 로고가 있으면 그 사진, 없으면 지금의 역할 아이콘(제보 c8426e93)
describe('Avatar — 프로젝트 로고', () => {
  it('로고가 있으면 사진을 넣고 역할 아이콘은 빼며 같은 .avatar 틀을 쓴다', () => {
    const html = renderToStaticMarkup(createElement(Avatar, { role: 'design', logo: '/media/image/kits-logo-abc.png' }));
    expect(html).toContain('class="avatar avatar-logo"');
    expect(html).toContain('/media/image/kits-logo-abc.png');
    expect(html).not.toContain('<svg');
    expect(html).toContain('aria-hidden="true"');
  });

  it('로고가 없으면 역할 아이콘 그대로(회귀 없음)', () => {
    const html = renderToStaticMarkup(createElement(Avatar, { role: 'design' }));
    expect(html).toContain('class="avatar"');
    expect(html).toContain('<svg');
    expect(html).not.toContain('<img');
  });
});
