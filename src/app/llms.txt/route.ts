import { plain } from '@/components/Rich';
import { PROJECT_IDS, getContent, getProject, getWorkEntries } from '@/content';
import { SITE_URL, designPath, localePath, projectPath } from '@/i18n/config';

// AI 가 이 사이트를 읽을 때 쓰는 안내 파일(llms.txt). sitemap 처럼 콘텐츠에서 만들어 글과 어긋나지 않게 한다.
// 2026-10-30 Zecle SCORE 에서 「llms.txt 없음」 경고였다. 파일이 있다고 인용이 보장되지는 않는다.
export const dynamic = 'force-static';

export function GET() {
  const t = getContent('ko');
  const en = getContent('en');

  const projects = PROJECT_IDS.map((id) => getProject('ko', id))
    .filter((project) => project !== undefined)
    .map((project) => `- [${project.name}](${SITE_URL}${projectPath('ko', project.id)}): ${plain(project.tagline)}`);
  const others = getWorkEntries('ko').map((entry) => `- [${entry.name}](${SITE_URL}${projectPath('ko', entry.slug)}): ${plain(entry.body)}`);
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
    `- [${t.design.title}](${SITE_URL}${designPath('ko')})`,
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
