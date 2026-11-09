import { plain } from '@/components/Rich';
import { getContent, getProject, getWorkEntries, projectIds } from '@/content';
import { getSite } from '@/content/store';
import { SITE_URL, localePath, projectPath } from '@/i18n/config';

// AI 가 이 사이트를 읽을 때 쓰는 안내 파일(llms.txt). sitemap 처럼 콘텐츠에서 만들어 글과 어긋나지 않게 한다.
// 2026-10-30 Zecle SCORE 에서 「llms.txt 없음」 경고였다. 파일이 있다고 인용이 보장되지는 않는다.
// 한 번 만들어 캐시에 두고, 본문을 저장하면 API 가 이 주소를 다시 만들게 한다(ops.ts affectedPaths).
export const dynamic = 'force-static';

export async function GET() {
  const site = await getSite();
  const t = getContent(site, 'ko');
  const en = getContent(site, 'en');

  const projects = projectIds(site).map((id) => getProject(site, 'ko', id))
    .filter((project) => project !== undefined)
    .map((project) => `- [${project.name}](${SITE_URL}${projectPath('ko', project.id)}): ${plain(project.tagline)}`);
  const others = getWorkEntries(site, 'ko').map((entry) => `- [${entry.name}](${SITE_URL}${projectPath('ko', entry.slug)}): ${plain(entry.body)}`);
  const links = [...t.hero.links, ...t.contact.links]
    .filter((link) => link.href.startsWith('https://'))
    .map((link) => `- [${link.label}](${link.href})`);

  const body = [
    `# ${t.hero.name} (SOLHUN)`,
    '',
    `> ${t.meta.description}`,
    '',
    `${t.hero.role}. ${plain(t.hero.lead)}`,
    '',
    '## 페이지',
    `- [포트폴리오 (한국어)](${SITE_URL}${localePath('ko')})`,
    `- [Portfolio (English)](${SITE_URL}${localePath('en')}): ${en.meta.description}`,
    `- [Portafolio (Español)](${SITE_URL}${localePath('es')})`,
    '',
    '## 주요 프로젝트',
    ...projects,
    '',
    '## 그 외 작업',
    ...others,
    '',
    '## 연락',
    `- 이메일: ${t.contact.email}`,
    ...links,
    '',
  ].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
