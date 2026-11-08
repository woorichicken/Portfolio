import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// `next dev` 에서도 wrangler 의 로컬 D1·R2 바인딩을 쓸 수 있게 한다(운영 빌드에는 영향 없음).
initOpenNextCloudflareForDev();

// ── solhun.com 을 CLI Manager 사이트에서 넘겨받을 때 필요한 옛 경로 처리 ─────────────────
// 정본: solhun-web-page 저장소 docs/domain-migration-climanager.md (「Portfolio 에 넣을 next.config.ts 스니펫」).
// 도메인을 옮기기 전에는 필요 없으므로 **기본은 꺼져 있다.** 빌드 env `CLI_MANAGER_ROUTES=1` 일 때만 켠다.
// 켜는 시점과 방법은 docs/DEPLOY.md 「도메인 이전」 절.
const CLI_MANAGER_ROUTES_ENABLED = process.env.CLI_MANAGER_ROUTES === "1";

// CLI Manager 사이트의 새 주소 (solhun.com 에서 이전, solhun-web-page 저장소)
const CLI_MANAGER_URL = "https://climanager.solhun.com";

// 새 주소로 영구 이동한 CLI Manager 페이지. 경로·쿼리는 그대로 붙여 보낸다.
// /changelog 는 구버전 CLI Manager 앱이 계속 여는 주소라 지우면 안 된다.
// solhun-web-page 의 LEGACY_MOVED_PATHS 와 같은 목록이다 — 두 곳을 함께 고친다.
const MOVED_TO_CLI_MANAGER = [
  "/changelog",
  "/docs",
  "/gallery",
  "/roadmap",
  "/feedback",
  "/compare/:path*",
  // "/admin/:path*" 는 뺐다(2026-11-01) — 리브랜딩이 /admin 에 포트폴리오 어드민을 두었고, 옮겨 갈 곳
  // climanager.solhun.com/admin 은 404 다(실측). 켜 두면 운영의 /admin 이 그 404 로 튕긴다(:path* 는 0개 구간도 맞는다).
  "/products/:path*",
];

// 주소가 바뀌면 안 되는 페이지 — Google OAuth 동의 화면(FAIR Social Ops)에 등록된 URL.
// 리디렉트하지 않고 이 주소 그대로 CLI Manager 쪽 내용을 보여 준다.
const PROXIED_FROM_CLI_MANAGER = ["/privacy", "/terms", "/apps/fair-social-ops"];

// 결과물만 모은 화면(/design)은 없앴다(2026-11-03 리뷰 A안 — 역할 화면의 「만든 화면과 도구」 행과 겹쳤다).
// 옛 링크·검색 결과는 「디자인 엔지니어」 역할 화면의 그 행으로 보낸다. 이건 도메인 이전과 상관없이 늘 켠다.
const REMOVED_DESIGN_PAGE = [
  { source: "/design", destination: "/as/design#row-artifacts", permanent: true },
  { source: "/:locale(en|es)/design", destination: "/:locale/as/design#row-artifacts", permanent: true },
];

const nextConfig: NextConfig = {
  async redirects() {
    if (!CLI_MANAGER_ROUTES_ENABLED) return REMOVED_DESIGN_PAGE;
    return [
      ...REMOVED_DESIGN_PAGE,
      ...MOVED_TO_CLI_MANAGER.map((source) => ({
        source,
        destination: `${CLI_MANAGER_URL}${source}`,
        statusCode: 301 as const,
      })),
      // API 는 308: 301 이면 POST 가 GET 으로 바뀐다.
      // 단 /api/content/* 는 이 사이트의 콘텐츠 API(D1)라 보내지 않는다 — CLI Manager 쪽 API 는 changelogs·roadmaps 뿐이다(2026-11-08 확인).
      // 첫 구간(:first)과 나머지(:rest*)를 나눠 받는다 — 한 칸에 슬래시째 받으면 목적지를 만들 때 「[^/]+ 가 아니다」로 500 이 난다(/api/roadmaps/x 실측)
      { source: "/api", destination: `${CLI_MANAGER_URL}/api`, statusCode: 308 as const },
      {
        source: "/api/:first((?!content(?:/|$))[^/]+)/:rest*",
        destination: `${CLI_MANAGER_URL}/api/:first/:rest*`,
        statusCode: 308 as const,
      },
    ];
  },
  async rewrites() {
    if (!CLI_MANAGER_ROUTES_ENABLED) return { beforeFiles: [], afterFiles: [], fallback: [] };
    return {
      // 파일시스템(Portfolio 페이지)보다 먼저 — 같은 경로를 Portfolio 가 만들어도 프록시가 이긴다
      beforeFiles: PROXIED_FROM_CLI_MANAGER.map((source) => ({
        source,
        destination: `${CLI_MANAGER_URL}${source}`,
      })),
      afterFiles: [],
      // Portfolio 에 없는 이미지·영상만 CLI Manager 에서 가져온다(프록시 페이지의 로고, 옛 OG 이미지 등).
      // fallback 은 Portfolio 의 페이지·public 파일을 전부 확인한 뒤에만 탄다 — /work/*.jpg 는 여기로 새지 않는다.
      fallback: [
        {
          source: "/:file((?:.+)\\.(?:png|jpg|jpeg|webp|svg|gif|mp4))",
          destination: `${CLI_MANAGER_URL}/:file`,
        },
      ],
    };
  },
};

export default nextConfig;
