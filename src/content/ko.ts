import { shot } from './images';
import type { Content } from './types';

// 정본: ~/Downloads/portfolio-2026 (정경훈_포트폴리오_AX.pdf · drafts/03_전체이력_총정리.md · drafts/portfolio/portfolio.html).
// 여기 있는 숫자와 인용은 전부 그 자료에서 옮겼다. 새 수치를 넣을 때는 자료에 먼저 근거를 남긴다.

const ko: Content = {
  meta: {
    title: '정경훈 (SOLHUN) — 처음부터 끝까지 관여하는 개발자',
    description:
      '라이트소프트 개발자 정경훈의 포트폴리오. 요청·기획·구현·검수·배포·피드백 전 과정을 맡으며 KITS, FAIR 인사노무 CRM/ERP, CLI Manager 등을 만들었습니다.',
  },
  a11y: { skip: '본문으로 건너뛰기', primaryNav: '주 메뉴', language: '언어 선택', openImage: '이미지 크게 보기', closeImage: '닫기', prevImage: '이전 이미지', nextImage: '다음 이미지', copied: '복사됨' },
  nav: { work: '프로젝트', timeline: '연표', contact: '연락' },
  hero: {
    name: '정경훈',
    role: '라이트소프트 개발자 · CLI Manager 제작자',
    lead: '개발이라는 한 칸에 머물지 않고 **일의 처음부터 끝까지 관여**합니다. 요청을 받는 순간부터 기획·구현·검수·배포·피드백까지 **전 과정을 정의**하고, 그 안에서 개선점을 찾아 공부합니다.',
    keywords: [
      { title: '전 과정 탐구', body: '요청부터 피드백까지 직접 맡아 일의 흐름 전체를 이해합니다.' },
      { title: '프로세스 개선', body: '피드백이 누락되고 반복되는 지점을 찾아 도구와 절차로 바꿉니다.' },
      { title: '함께 쓰는 도구', body: '만든 도구를 동료·디자이너·고객이 실제로 쓰도록 공유하고 다듬습니다.' },
    ],
    links: [
      { label: 'GitHub', href: 'https://github.com/woorichicken' },
      { label: '이메일', href: 'mailto:solhun.jeong@gmail.com' },
    ],
  },
  stats: {
    title: '숫자로 본 2년',
    items: [
      { value: '19', label: '디자이너·고객과 함께한 회사 프로젝트' },
      { value: '#10', label: 'Product Hunt Product of the Day — CLI Manager' },
      { value: '$1,200+', label: 'CLI Manager 초기 유료 판매 수익 · 이후 오픈소스 전환' },
    ],
  },
  work: {
    title: '프로젝트',
    intro: '라이트소프트에서 고객사와 함께한 일, 그리고 개인으로 맡은 일입니다.',
    labels: { before: '이전', after: '이후', lesson: '배운 점', results: '결과' },
    projects: [
      {
        id: 'kits',
        context: '라이트소프트 · 고객사 KITS EDU',
        name: 'KITS',
        tagline: '진단평가부터 학습까지, 폰·태블릿·웹 다섯 개 화면을 가진 교육 서비스',
        summary:
          '한 화면이 앱·모바일웹·데스크톱웹·교사웹·관리자웹으로 퍼지는 구조입니다. 개발보다 **디자이너·클라이언트와 화면을 맞추는 일**이 더 컸고, 명확하지 않거나 양이 많아지면 누락되는 **피드백 과정을 디자이너와 함께 고쳐** 나갔습니다.',
        facts: [
          { label: '기간', value: '2025.11 – 진행 중' },
          { label: '역할', value: '프론트·QA 총괄' },
          { label: '플랫폼', value: '앱 · 웹 · 교사 · 관리자' },
          { label: '함께', value: '디자이너 · 개발자 · 대표 · 고객' },
        ],
        cover: shot('lw_kits-hero-phones', 'KITS 앱 화면이 담긴 휴대폰 여러 대'),
        improvements: [
          {
            title: '반응형 검수',
            before: '크롬 창을 늘렸다 줄였다 하며 한 화면씩 확인',
            after: '**본화면 55개와 모달 39개를 세로·가로로 한 번에 보는 리뷰 보드**. 화면마다 코멘트 칸이 있어 디자이너 코멘트가 그대로 작업 지시가 됩니다.',
            metric: { value: '55 / 55', label: '태블릿 화면 전수 확인 · 오류 0' },
          },
          {
            title: '피드백 전달',
            before: '슬랙 메시지 한 통에 텍스트 피드백 60개',
            after: '**실제 화면 위 버튼·글자를 집어서 바로 제보하는 위젯**을 만들어 앱·웹·교사·관리자 4개 앱에 붙였습니다.',
            metric: { value: '41건', label: '디자이너가 하루에 직접 남긴 제보' },
          },
          {
            title: '진행 추적',
            before: '613줄 검수 문서를 손으로 갱신, 반영 여부는 다시 물어봐야 앎',
            after: '**제보 → 사내 시스템 → Linear 이슈 → 슬랙 알림이 자동으로** 이어집니다. 반영되면 슬랙에 무엇을 고쳤는지와 리뷰 보드 링크가 올라갑니다.',
            metric: { value: '301+', label: '상태가 관리되는 제보' },
          },
        ],
        metrics: [
          { value: '41 → 22', label: '하루 몰린 제보 41건 중 3시간 만에 처리한 22건' },
          { value: '94+', label: '리뷰 보드 한 페이지에서 동시에 확인하는 화면' },
        ],
        quotes: [
          { text: '지난 1차 피드백 이후 많은 부분이 개선된 것을 확인할 수 있었습니다. 이번에는 1차 피드백에 비해 분량도 많이 줄었고, 덕분에 추적도 용이하게 진행할 수 있었습니다.', who: '클라이언트 — 2차 검수 완료, 2026.07' },
          { text: '이런 외주사는 처음입니다.', who: '클라이언트 — 검수 회의 중' },
        ],
        lesson: {
          title: '도구보다 자리',
          body: '리뷰 보드는 로컬 HTML로 공유했을 때 아무도 열지 않았고, 배포된 URL이 되고 나서야 쓰이기 시작했습니다. 도구를 만든 것과 실제로 쓰이는 것은 다른 일이었고, **상대의 업무 흐름 안에서 편해야 설득력이 생긴다**는 것을 배웠습니다.',
        },
        gallery: [
          shot('kits_board_top', '리뷰 보드 상단', '화면마다 세로·가로 캡처와 코멘트 칸이 있는 리뷰 보드'),
          shot('kits_picker_top', '요소 지목 모드', '화면 위 요소를 직접 집어서 제보하는 "요소 지목" 모드'),
          shot('kits_dp_top', '사내 시스템에 쌓인 제보 목록', '화면 이름·내용·유형이 자동으로 정리된 제보 목록'),
          shot('kits_bot_crop', '슬랙 반영 알림', '반영되면 슬랙에 수정 내용과 리뷰 보드 링크가 올라갑니다'),
        ],
      },
      {
        id: 'fair',
        context: '개인 도급 · AX',
        name: 'FAIR 인사노무 CRM/ERP',
        tagline: '노무법인의 컨설팅 전 과정(진단 → 설계 → 실행 → 변화관리 → 평가)을 ERP화',
        summary:
          '노무사와 한 팀처럼 붙어서 진행한 프로젝트입니다. 체크리스트와 문서 중심이던 **수작업을 전산화**하고, **컨설팅 과정을 AI로 전환(AX)**했습니다. AI가 인용한 법조문을 실제 법령과 대조하는 **법률 검증 기능**도 넣었습니다.',
        facts: [
          { label: '기간', value: '2026.02 – 진행 중' },
          { label: '역할', value: '기획 · 개발 · 운영 전부' },
          { label: '앱', value: 'CRM · 공개 사이트 · 직원 앱' },
          { label: '함께', value: '노무사 · 역할별 사용자' },
        ],
        cover: shot('efm_v4', '직접 만든 FAIR 제품 소개 영상의 한 장면'),
        improvements: [
          {
            title: '개발 밖의 전 과정',
            before: '개발 외주는 구현만 맡는 경우가 많음',
            after: '계약(03.08) → 기능명세 v2~v2.2(04.13–17) → 관리자·자문 사용 가이드(05.17–26) → 디자인 시스템 핸드오프(06.08) → 제안서·소개 영상·카드뉴스(07–09)까지 직접 맡았습니다.',
          },
          {
            title: '역할별 화면 설계',
            before: '같은 데이터를 모두가 같은 화면으로 봄',
            after: '대표·임원·자문·사건 담당·직원마다 볼 수 있는 데이터와 화면을 다르게 설계하고 노무사와 공유했습니다. 그 과정에서 인사노무 업무를 깊이 공부했습니다.',
          },
        ],
        metrics: [
          { value: '3', label: '운영 중인 앱 — CRM · 공개 사이트 · 직원 앱' },
          { value: '1,086', label: '커밋 · PR 164건 병합' },
        ],
        lesson: {
          title: '혼자 맡을수록 사용자 관점을 일부러',
          body: '사용 가이드를 쓰며 화면의 빈틈을 찾았고, 소개 영상을 만들며 **이 제품이 누구의 어떤 업무를 줄이는지 한 문장으로** 정리할 수 있었습니다.',
        },
        gallery: [
          shot('efm_stages_c', '진행 단계 화면', '진행 단계 — 계약 → 진단 → 설계 → 실행 → 변화관리 → 평가'),
          shot('efm_diag_c', 'AS-IS 진단 화면', 'AS-IS 진단 — 영역별 문제와 중요도'),
          shot('efm_kpi_c', '성과관리 화면', '성과관리 — KPI 변경을 승인 요청으로'),
          shot('efm_att', '공개 사이트 근태 데모', '공개 사이트의 근태 데모'),
        ],
      },
      {
        id: 'cli-manager',
        context: '개인 제품 · 오픈소스',
        name: 'CLI Manager',
        tagline: '여러 AI 코딩 에이전트(CLI)를 한 화면에서 관리하는 데스크톱 앱',
        summary:
          '터미널 10개를 띄워 놓고 뭐가 어디인지 모르겠던 제 불편에서 시작해, **10개월 동안 57번 릴리스한 공개 제품**이 됐습니다. 기획·개발·릴리스·랜딩·마케팅을 혼자 맡았고, 초기에는 **유료 제품으로 수익을 낸 뒤 오픈소스로 전환**했습니다.',
        facts: [
          { label: '기간', value: '2025.11 – 진행 중' },
          { label: '역할', value: '1인 제작' },
          { label: '플랫폼', value: 'macOS (Electron)' },
          { label: '라이선스', value: 'MIT 오픈소스' },
        ],
        cover: shot('cli_main', 'CLI Manager 메인 화면'),
        improvements: [
          {
            badge: '최신 업데이트 · v1.10.0 · 2026.09.29',
            title: 'AI Control API',
            before: '비대화형 실행은 AI가 엉뚱한 작업을 해도 끝날 때까지 모름',
            after: 'v1.9(2026.09.23)에서 **다른 AI가 CLI Manager 안에서 세션을 열고 일하도록 로컬 API**를 만들었습니다. AI 세션은 녹색으로 표시돼 언제든 확인하고 개입할 수 있습니다. v1.10(2026.09.29)부터는 AI가 그 세션의 메모도 함께 읽습니다.',
          },
        ],
        metrics: [
          { value: '#10', label: 'Product Hunt Product of the Day · 105 upvote' },
          { value: '57', label: '릴리스 · 10개월' },
          { value: '$1,200+', label: '초기 유료 수익 → 오픈소스 전환' },
          { value: '2.3만', label: 'Reddit 게시물 최고 조회' },
        ],
        quotes: [{ text: 'I picked this up today and am obsessed!!', who: 'Product Hunt 사용자 댓글' }],
        lesson: {
          title: '가장 싼 QA',
          body: '최근 업데이트에서 잡힌 결함 둘 다 "기능"이 아니라 보는 경험 쪽이었습니다. **제가 만든 도구를 제가 매일 쓰는 것이 가장 싼 QA**라는 걸 느꼈습니다.',
        },
        gallery: [
          shot('cli_green', 'AI 세션이 녹색으로 표시된 화면', '실제 AI 에이전트가 CLI Manager 안에서 도는 화면 — AI 세션은 녹색'),
          shot('cli_ph', 'Product Hunt 페이지', 'Product Hunt 페이지 — 105 upvote'),
          shot('cli_loop', 'Loop Dashboard', 'v1.6 Loop Dashboard'),
        ],
        links: [
          { label: '웹사이트', href: 'https://climanager.solhun.com' },
          { label: 'GitHub', href: 'https://github.com/woorichicken/CLI_manager' },
          { label: 'Product Hunt', href: 'https://www.producthunt.com/products/cli-manager' },
        ],
      },
      {
        id: 'automation',
        context: '라이트소프트 · 사내 도구',
        name: '사내 개발 자동화',
        tagline: '이슈를 받아 문서 기반으로 개발하고, 막히면 사람을 부르는 데몬 Symphony와 문서·QA 플랫폼 라쏘런',
        summary:
          '반복되는 이슈 처리를 사람이 일일이 챙기는 문제(진행 확인·리뷰·재요청의 반복)를 풀려고 만들었습니다. **이슈를 받아 문서 기반으로 AI 에이전트가 개발을 진행**하고, **막히면 슬랙으로 사람을 부릅니다**. 문서·테스트케이스·제보는 라쏘런에서 한 흐름으로 관리합니다.',
        facts: [
          { label: '기간', value: '2026.05 – 진행 중' },
          { label: '역할', value: '설계 · 개발 · 사내 전파' },
          { label: '범위', value: 'Symphony · 라쏘런 · 피드백 위젯' },
          { label: '함께', value: '대표 · 사내 개발자' },
        ],
        cover: shot('sym_flow', '사내 문서·QA 플랫폼의 흐름 화면'),
        metrics: [
          { value: '44', label: '데모 영상 공유 후 달린 댓글' },
          { value: '798', label: 'Symphony 커밋' },
        ],
        quotes: [
          { text: '궁극적으로는 대시보드에서, 개발자 아니더라도 관리가 되면 좋겠습니다.', who: '대표 — 데모 스레드, 2026.07' },
          { text: '저도 사실 내부에서만 쓸 줄 알고 사용성을 거의 신경을 안 썼는데, 말씀해주신 부분 반영하겠습니다.', who: '본인 — 같은 자리에서 프로젝트 등록 절차를 만들어 대응' },
        ],
        lesson: {
          title: '사내 공유 기록',
          body: '2026.02 AI 도구 사용법 공유를 정례화(3회+)하고 E2E·유닛 테스트 자동화 워크플로우를 발표했습니다. 2026.03에는 아이디어 → 슬랙 승인 → 자동 발행 흐름을 공지해 디자이너가 7분 만에 첫 아이디어를 올렸고, 2026.07 공식 데모 이후 KITS 교사·관리자 웹 개발에 투입했습니다.',
        },
      },
      {
        id: 'purple',
        context: '라이트소프트 · 고객사 Purple Academy',
        name: '퍼플',
        tagline: '영어 학습 LMS의 관리자 앱 — 커리큘럼 · 퀴즈 · 클래스 · 리딩특공대',
        summary:
          '퀴즈 17종 × 문항 16타입과 운영 중인 데이터를 다루는 관리자 시스템입니다. 문항이 퀴즈에 묶여 재사용이 안 되던 구조를, **문항을 따로 관리하고 퀴즈와 연결하는 구조로 재설계**하고 **운영 데이터 이전을 설계·계획·실행까지 단계별로 검증**했습니다.',
        facts: [
          { label: '기간', value: '2025.11 – 2026.06' },
          { label: '역할', value: '관리자 웹 · 데이터 구조 · QA' },
          { label: '범위', value: '커리큘럼 · 퀴즈 · 클래스' },
          { label: '함께', value: '팀 리드 · 개발자 · 고객 · 디자이너' },
        ],
        cover: shot('pur_class', '퍼플 관리자 클래스 화면'),
        improvements: [
          {
            title: 'QA 검증',
            before: '화면을 하나씩 눌러 보며 버그 찾기',
            after: '타입별 등록 → 조회 → 수정 → 삭제를 왕복하며 저장한 값이 그대로 돌아오는지까지 표로 검증했습니다. AI QA 도구도 먼저 써 보고 팀에 공유해, 동료 두 명이 각자 영역에 바로 적용했습니다.',
            metric: { value: '17×16', label: 'CRUD 왕복 검증 매트릭스, 5시간 41분' },
          },
        ],
        metrics: [
          { value: '6,752', label: '퀴즈 운영 DB 이전 · 검증 오차 0건' },
          { value: '137일', label: '전담 채널 · 잔금까지 완주' },
        ],
        lesson: {
          title: '범위가 흔들리면 먼저 말하기',
          body: '40줄로 본 작업이 400줄이 됐을 때 먼저 공유하지 못했고, 팀 리드가 고객과 재협상해 줬습니다. 그 뒤로 모든 작업을 **"추정 → 실측" 순서**로 적습니다.',
        },
        gallery: [
          shot('pur_matrix', 'CRUD 왕복 매트릭스', '퀴즈 타입별 CRUD 왕복 매트릭스'),
          shot('pur_quiz', '퀴즈 등록 화면', '퀴즈 등록·수정 — 타입별 문항 구성'),
        ],
      },
      {
        id: 'porterx',
        context: '라이트소프트 · 고객사 · App Store 출시',
        name: 'PorterX',
        tagline: '여행자의 이동 동선과 현지 구매 요청을 잇는 미션 매칭 앱',
        summary: '결제·환불·스토어 심사·보안까지 **출시 이후 운영 이슈를 가장 많이 다룬** 프로젝트입니다.',
        facts: [
          { label: '기간', value: '2025.08 – 2026.04' },
          { label: '역할', value: '앱 기능 · 디자인 · 운영 대응' },
          { label: '플랫폼', value: 'iOS · Android · 어드민' },
          { label: '함께', value: '개발자 · 대표 · 고객' },
        ],
        cover: shot('ptx_home', 'PorterX 홈 — 미션 매칭'),
        improvements: [
          { title: '결제', before: 'PG 정책이 바뀔 때마다 정산 구조가 흔들림', after: 'PG를 네 번 바꾸며 정산 구조를 재설계하고 인앱결제로 정리했습니다.' },
          { title: '환불', before: '크레딧을 쓰고 환불받는 악용(환불 알림 미수신)', after: '3일 만에 환불 웹훅과 크레딧 자동 회수를 붙였습니다.' },
          { title: '배포', before: '애플 심사 반려 2회, 수정마다 재심사', after: 'OTA 업데이트로 전환해 수정이 매번 재심사를 기다리지 않게 했습니다.' },
          { title: '보안', before: 'AI 에이전트로 빠르게 만든 코드에 부족했던 보안 정책', after: '4개월 뒤 전수 감사로 Critical 4건을 차단했습니다.' },
        ],
        gallery: [
          shot('ptx_credit', '미션·크레딧 화면', '미션·크레딧 화면'),
          shot('ptx_comm', '커뮤니티 화면', '커뮤니티(닉네임 블러)'),
        ],
      },
      {
        id: 'ncdigitec',
        context: '라이트소프트 · 고객사 · 삼성전자 공식 파트너',
        name: '엔씨디지텍',
        tagline: '삼성 AI구독(렌탈) 자사몰 리디자인',
        summary:
          '리디자인을 맡아 디자이너·고객 피드백을 반영하는 사이클을 운영했습니다. **디자이너가 피드백 도구를 직접 설치할 수 있게 세팅**하고, 들어온 제보는 모아서 반영한 뒤 "어제·오늘 올라온 제보 6건 반영"처럼 목록으로 공유했습니다. KITS에서 다듬은 피드백 과정을 그대로 이어 갔습니다.',
        facts: [
          { label: '기간', value: '2026.04 – 진행 중' },
          { label: '역할', value: '리디자인 리드 · 운영' },
          { label: '범위', value: '메인 · 상품 · 구독 상담' },
          { label: '함께', value: '디자이너 · 대표 · 고객' },
        ],
        cover: shot('ncd_kv', '엔씨디지텍 자사몰 메인 키비주얼'),
        improvements: [
          {
            title: '피드백 반영',
            before: '수정 요청이 메신저·문서로 흩어져 전달',
            after: '화면에서 바로 남기는 제보 → 모아서 반영 → 반영 목록 공유',
          },
        ],
        gallery: [
          shot('ncd_ux', '화면 위에 남긴 수정 피드백', '화면 위에 남긴 수정 피드백(GNB)'),
          shot('ncd_plan', '케어 플랜 선택 화면', '케어 플랜 선택'),
        ],
      },
      {
        id: 'content',
        context: '개인 · 오픈소스',
        name: '콘텐츠 자동화',
        tagline: '콘텐츠 수집·기획·제작·발행을 잇는 파이프라인',
        summary:
          'X 인기글 수집 → AI 에이전트 둘의 주제 토론(최대 3라운드) → 리서치·팩트체크·카피·렌더·캡션 → **Threads·X·Instagram 동시 발행**까지 이어지는 파이프라인입니다. 매일 반응 데이터를 모아 잘된 글은 다른 각도로 다시 만들었고, API 키만 비워 **오픈소스로 공개했습니다**.',
        facts: [
          { label: '기간', value: '2026.03 – 2026.04' },
          { label: '역할', value: '설계 · 개발 · 운영' },
          { label: '채널', value: 'Threads · X · Instagram' },
          { label: '이후', value: '사내 콘텐츠 운영 플랫폼으로 확장' },
        ],
        cover: shot('ct_coord', '콘텐츠 자동화로 만든 카드뉴스'),
        metrics: [
          { value: '78만', label: '3주 누적 조회수' },
          { value: '94 → 8,600', label: 'Threads 팔로워(정점)' },
          { value: '100+', label: '발행 · 1,500뷰 이상 50개' },
        ],
        lesson: {
          title: '팀이 같이 쓰는 도구로',
          body: '사내에는 "짧게라도 적어두면 AI가 알아서 발전시킵니다"로 성과를 발표했고, 이후 사내 콘텐츠 운영 플랫폼과 카드뉴스 자동 생성으로 키워 **팀이 같이 쓰는 도구가 됐습니다**.',
        },
        gallery: [shot('cli_card', 'CLI Manager 소개 카드뉴스', '파이프라인으로 만든 CLI Manager 소개 카드')],
        links: [{ label: 'GitHub', href: 'https://github.com/lightsoft-dev/claude-content-pipeline' }],
      },
    ],
  },
  others: {
    title: '그 외 프로젝트',
    intro: '짧게 참여했거나 지금 막 시작한 일들입니다.',
    items: [
      {
        slug: 'design-atlas',
        name: '디자인 아틀라스',
        period: '2026.09 – 진행 중 · 개인',
        body: '모션·효과·컴포넌트·UX 용어 **893개(34개 분야)**를 한/영 설명과 움직이는 예시, 코드로 모은 디자인 사전.',
        shot: shot('design_atlas', '디자인 아틀라스 첫 화면'),
        detail: {
          facts: [
            { label: '기간', value: '2026.09 – 진행 중' },
            { label: '역할', value: '1인 제작' },
            { label: '규모', value: '용어 893개 · 34개 분야' },
            { label: '언어', value: '한국어 · 영어' },
          ],
          paragraphs: ['모션·효과·3D·컴포넌트·UX 용어를 한/영 설명과 라이브 데모, 코드로 함께 보여 주는 디자인 용어 사전입니다.'],
          links: [{ label: '사이트', href: 'https://design.solhun.com' }],
        },
      },
      {
        slug: 'switch-on',
        name: '스위치온',
        period: '2026.04 – 2026.09',
        body: '보드게임을 BGA Studio로 이식 · 알파/베타.',
        shot: shot('sw_board', '스위치온 게임 보드'),
        detail: {
          facts: [
            { label: '기간', value: '2026.04 – 2026.09' },
            { label: '역할', value: '이식 개발 (단독)' },
            { label: '구성', value: 'Next.js 프로토타입 · Board Game Arena 포트' },
            { label: '함께', value: '대표' },
          ],
          paragraphs: ['보드게임 스위치온을 Next.js 프로토타입으로 먼저 만들고, Board Game Arena(BGA Studio)로 이식해 알파·베타까지 배포했습니다.'],
        },
      },
      {
        slug: 'dolphin-crm',
        name: '돌핀 CRM',
        period: '2025.10 – 2026.07',
        body: '세척기 주문·A/S·재고 관리 — **제품 데이터 관리(규격·용량) 구조 정리**와 메뉴 단순화, 웹 분석 연동.',
        shot: shot('dp_stats', '돌핀 CRM 통계 화면'),
        detail: {
          facts: [
            { label: '기간', value: '2025.10 – 2026.07' },
            { label: '역할', value: '지원 투입 (주 담당은 동료 개발자)' },
            { label: '범위', value: '세척기 주문 · A/S · 재고 관리 어드민' },
          ],
          paragraphs: [
            '2025.10 — 제품 데이터 관리 페이지와 규격·용량 관리 기능을 만들고, 제품주문 메뉴 구조를 단순화했습니다.',
            '2026.07 — 웹 분석(PostHog)을 연동하고, 통합검색과 쓰이지 않는 수금 페이지를 정리하면서 주문제품 등록 버그를 고쳤습니다.',
          ],
        },
      },
      {
        slug: 'bigdatahub-webzine',
        name: '빅데이터허브 웹진',
        period: '2026.04 – 2026.07',
        body: '대학 사업단 웹진과 작가·포인트 관리 어드민.',
        shot: shot('web_admin', '웹진 어드민 화면'),
        detail: {
          facts: [
            { label: '기간', value: '2026.04 – 2026.07' },
            { label: '범위', value: '웹진 · 작가·포인트 관리 어드민' },
            { label: '함께', value: '사업단 팀 4인' },
          ],
          paragraphs: ['대학 빅데이터 사업단의 웹진과, 작가·포인트를 관리하는 어드민을 팀으로 만들었습니다.'],
        },
      },
      {
        slug: 'light-archive',
        name: 'light-archive',
        period: '2026.02 – 2026.09',
        body: '사내 지식·블로그 플랫폼 archive.lightsoft.dev.',
        shot: shot('la_home', 'light-archive 홈'),
        detail: {
          facts: [
            { label: '기간', value: '2026.02 – 2026.09' },
            { label: '역할', value: '개발' },
            { label: '함께', value: '대표 · 디자이너' },
          ],
          paragraphs: ['사내 지식 공유·블로그 플랫폼입니다. 개발을 맡았고, 카드뉴스 프로토타입을 여기서 처음 만들었습니다.'],
          links: [{ label: '사이트', href: 'https://archive.lightsoft.dev' }],
        },
      },
      {
        slug: 'motion-meme',
        name: 'Motion Meme',
        period: '2026.03 · 사내 해커톤 2위',
        body: '밈 챌린지 기반 소셜 플랫폼 MVP.',
        shot: shot('lw_motion', 'Motion Meme 화면'),
        detail: {
          facts: [
            { label: '기간', value: '2026.03 (해커톤)' },
            { label: '팀', value: 'Lightsoft' },
            { label: '결과', value: '사내 해커톤 2위' },
          ],
          paragraphs: ['밈 챌린지 영상을 중심으로 한 소셜 플랫폼 MVP입니다. 신고·차단·어드민·크레딧·결제 로직까지 넣어 운영할 수 있는 수준으로 구현했습니다.'],
          links: [{ label: '데모', href: 'https://motion-meme-mvp-j1rv.vercel.app' }],
        },
      },
      {
        slug: 'youtube-manager',
        name: '유튜브 매니저',
        period: '2026.03 – 2026.08',
        body: '제작 단계에 참여해 타사 시스템을 함께 만들었습니다.',
        shot: shot('yt_plan', '유튜브 매니저 기획 화면'),
        detail: {
          facts: [
            { label: '기간', value: '2026.03 – 2026.08' },
            { label: '함께', value: '개발자 2명' },
            { label: '구성', value: 'pnpm · Turborepo 모노레포 · Cloudflare D1 · Better Auth' },
          ],
          paragraphs: ['유튜브 영상 제작 과정(기획부터 쇼츠까지)을 관리하는 서비스 AutoTube입니다. 동료 두 명과 함께 제작 단계에 참여했습니다.'],
        },
      },
      {
        slug: 'lightsoft-web',
        name: '라이트소프트 홈페이지',
        period: '2025.10 – 진행 중 · 사내',
        body: '회사 웹과 작업 쇼케이스.',
        shot: shot('lw_work-1', '라이트소프트 홈페이지 작업 소개'),
        detail: {
          facts: [
            { label: '기간', value: '2025.10 – 진행 중' },
            { label: '역할', value: '초기 셋업 지원' },
          ],
          paragraphs: ['회사 공식 홈페이지와 작업 쇼케이스입니다. 초기 셋업을 지원했고, 이후에는 동료들이 주로 맡고 있습니다.'],
        },
      },
    ],
    contestsTitle: '대회 · 공모전',
    contests: 'AI TOP 100(본선·캠퍼스) · Litmers 바이브코딩 · 카카오 PlayMCP · DataHub 해커톤 · 법제처 공모전 기획',
  },
  early: {
    title: '라이트소프트 이전',
    intro: '2024–2025, 주변의 불편에서 시작한 것들입니다.',
    items: [
      {
        slug: 'debatetimer',
        name: 'DebateTimer.org',
        tag: '개인',
        body: '토론 동아리에서 쓰려고 처음 만든 서비스. 명지대 "비주얼식", 성신여대 "토달래식"처럼 **학교마다 다른 토론 방식을 넣으면서 다른 대학 동아리로 퍼졌습니다**.',
        shot: shot('dt_templates', '학교별 토론 방식을 고르는 템플릿 화면'),
        detail: {
          facts: [
            { label: '기간', value: '2025.03 – 2025.10' },
            { label: '역할', value: '개발 (협업자 1명)' },
            { label: '스택', value: 'Next.js · Supabase' },
            { label: '결과', value: '실도메인 배포 · 검색 유입' },
          ],
          paragraphs: ['2025년 3월 debatetimer.org 도메인으로 공개했고, 검색으로 사람들이 들어오는 실서비스로 운영했습니다.'],
        },
      },
      {
        slug: 'praynie',
        name: 'PrayNie',
        tag: '개인',
        body: '학교 선교회에서 기도제목을 모으고 나누는 불편을 줄이려고 만든 AI 기도제목 추천 플랫폼. 대중적인 서비스로는 발전하지 못했고, **만드는 것과 쓰이게 하는 것이 다르다**는 걸 처음 배웠습니다.',
        shot: shot('pray_mock', 'PrayNie 랜딩'),
        detail: {
          facts: [
            { label: '기간', value: '2025.04' },
            { label: '역할', value: '1인 개발' },
            { label: '스택', value: 'React · Supabase' },
          ],
          paragraphs: ['AI가 기도제목을 추천하고, 서로의 기도제목으로 소통하는 SNS형 기능을 넣었습니다.'],
        },
      },
      {
        slug: 'ddingsroom',
        name: '띵스룸',
        tag: '학교 · 공모전',
        body: '명지대 학생회관 스터디룸 예약 서비스. 백엔드 팀원으로 참여했고 창의적 SW 경진대회 **장려상을 받은 뒤 학교 공식 서비스가 됐습니다**.',
        shot: shot('dd_live', '지금도 운영 중인 띵스룸 예약 화면'),
        metrics: [
          { value: '851', label: '가입자' },
          { value: '4,261', label: '예약' },
        ],
        note: '2026.04 기준',
        detail: {
          facts: [
            { label: '기간', value: '2025.05 – 2025.07' },
            { label: '역할', value: '백엔드 (관리자 모듈)' },
            { label: '함께', value: '팀 4인' },
            { label: '결과', value: '제4회 창의적 SW 프로그램 경진대회 장려상' },
          ],
          paragraphs: ['캡스톤 팀에 백엔드로 합류해 관리자 모듈을 맡았습니다. 팀은 화면 설계와 ERD를 함께 맞추며 진행했습니다.'],
        },
      },
    ],
    devhoon: {
      name: 'DEV HOON',
      tag: '대학생 개발팀 · 2024.04 –',
      body: '학교 동료들과 "DEV HOON"이라는 이름으로 외주를 받았습니다. 팀 리더로 기획과 개발을 맡았고, 크몽 리뷰는 모두 5.0이었습니다. 첫 고객은 노무법인으로, 2025년 1월 홈페이지 재구축에서 시작해 AI가 SEO 메타데이터를 채워 주는 관리 도구까지 만들었습니다.',
      history: [
        { date: '2025.01', text: 'FAIR 홈페이지 재구축' },
        { date: '2025.02', text: 'AI SEO 콘텐츠 관리 — 공지·뉴스레터 게시판' },
        { date: '2025.09', text: '생명보험사회공헌재단 캠페인 페이지 — 운영 중' },
        { date: '그 외', text: '소규모 외주, 공개할 수 없는 디자인 작업(브랜딩·홍보물)' },
      ],
      shots: [
        shot('early_devhoon-fairhr-website-2025-mockup', 'FAIR 홈페이지 메인(2025)', 'FAIR 홈페이지 메인(2025) — 첫 고객'),
        shot('early_kmong-fair-devhoon-profile', '크몽 셀러 프로필', '크몽 셀러 "대학생 개발팀, DEV 훈" · 리뷰 5.0'),
      ],
    },
  },
  timeline: {
    title: '연표',
    items: [
      { date: '2024.04', text: '대학생 개발팀 DEVHOON 결성' },
      { date: '2025.01', text: '첫 고객 FAIR 인사노무 홈페이지 재구축 · 크몽 외주(리뷰 5.0)' },
      { date: '2025.03', text: 'DebateTimer.org · PrayNie' },
      { date: '2025.06', text: '띵스룸(팀 · 백엔드) — 명지대 창의적 SW 경진대회 장려상' },
      { date: '2025.10', text: '라이트소프트 입사' },
      { date: '2025.11', text: 'KITS · PorterX · 퍼플 착수 · CLI Manager 공개(12월 Product Hunt #10)' },
      { date: '2026.02', text: 'FAIR CRM/ERP 도급 계약 · 사내 지식 플랫폼 light-archive' },
      { date: '2026.03', text: '콘텐츠 자동화(3주 78만 조회) · 유튜브 매니저 · Motion Meme(사내 해커톤 2위) · AI TOP 100' },
      { date: '2026.04', text: '엔씨디지텍 삼성 AI구독 자사몰 · 돌핀 CRM · 스위치온 · 빅데이터허브 웹진' },
      { date: '2026.07', text: 'Symphony 사내 데모 · 카카오 PlayMCP 출품' },
      { date: '2026.08', text: '라쏘런(사내 문서·QA 플랫폼) · 피드백 위젯 · 제보 → Linear → 슬랙 연동' },
      { date: '2026.09', text: '콘텐츠 운영 플랫폼 · CLI Manager v1.10 · 디자인 아틀라스' },
    ],
  },
  awards: {
    title: '수상 · 활동',
    items: [
      { date: '2025.10', title: '제4회 창의적 SW 프로그램 경진대회 장려상', org: '명지대학교', body: '스터디룸 예약 서비스 띵스룸 — 백엔드 담당. 이후 학교 공식 서비스가 됐습니다.' },
      { date: '2025.12', title: 'Product Hunt #10 Product of the Day', org: 'Product Hunt', body: 'CLI Manager, 105 upvote.' },
      { date: '2026.02', title: '사내 발표 — AI 기반 테스트 자동화 워크플로우', org: '라이트소프트', body: 'E2E·유닛 테스트 자동화 워크플로우와 적용 사례를 발표했습니다.' },
      { date: '2026.03', title: '사내 해커톤 2위', org: '라이트소프트', body: '밈 챌린지 기반 소셜 플랫폼 Motion Meme MVP.' },
      { date: '2026.07', title: '카카오 PlayMCP 콘테스트 출품', org: '카카오', body: 'AI 에이전트가 MCP 도구로 정착지를 운영하는 게임 서버 World of AgentCraft.' },
    ],
  },
  contact: {
    title: '연락',
    body: '함께 일할 이야기가 있다면 메일로 편하게 연락 주세요.',
    email: 'solhun.jeong@gmail.com',
    links: [
      { label: 'GitHub', href: 'https://github.com/woorichicken' },
      { label: 'Threads', href: 'https://www.threads.com/@aisolutiondev' },
    ],
    closing: '전 과정을 탐구하고, 그 안에서 개선점을 찾아 고치는 개발자가 되겠습니다.',
  },
  detail: { more: '상세 보기', back: '전체 포트폴리오로' },
  footer: { note: '사진 속 개인정보는 가렸고, 고객사 데이터는 데모 데이터입니다.' },
  feedback: {
    title: '피드백 모드',
    hint: '비밀번호를 입력하면 이 브라우저에서 피드백 버튼이 켜집니다.',
    placeholder: '비밀번호',
    submit: '켜기',
    cancel: '닫기',
    wrong: '비밀번호가 맞지 않습니다. 다시 입력해 주세요.',
  },
};

export default ko;
