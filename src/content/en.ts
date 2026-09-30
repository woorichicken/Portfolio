import { shot } from './images';
import type { Content } from './types';

// ko.ts 의 영어판. 숫자·인용은 ko.ts 와 같아야 한다 — 바꿀 때는 세 언어를 함께 바꾼다.

const en: Content = {
  meta: {
    title: 'Gyeonghun Jeong (SOLHUN) — a developer who owns the whole loop',
    description:
      'Portfolio of Gyeonghun Jeong, developer at Lightsoft. From request to spec, build, review, release and feedback — including KITS, the FAIR HR consulting CRM/ERP and CLI Manager.',
  },
  a11y: { skip: 'Skip to content', primaryNav: 'Main menu', language: 'Choose language', openImage: 'View image larger', closeImage: 'Close', copied: 'Copied' },
  nav: { work: 'Work', timeline: 'Timeline', contact: 'Contact' },
  hero: {
    name: 'Gyeonghun Jeong',
    role: 'Developer at Lightsoft · maker of CLI Manager',
    lead: "I don't stay inside the \"write the code\" box. From the moment a request comes in, **I define the whole path** — spec, build, review, release and feedback — and **keep looking for the parts of it that can work better**.",
    keywords: [
      { title: 'The whole path', body: 'I take on every step from request to feedback, so I understand how the work actually flows.' },
      { title: 'Better process', body: 'I find where feedback gets lost or repeated, and turn that spot into a tool or a routine.' },
      { title: 'Tools people use', body: 'I share what I build with teammates, designers and clients, and keep refining it until they use it.' },
    ],
    links: [
      { label: 'GitHub', href: 'https://github.com/woorichicken' },
      { label: 'Email', href: 'mailto:solhun.jeong@gmail.com' },
    ],
  },
  stats: {
    title: 'Two years in numbers',
    items: [
      { value: '19', label: 'company projects with designers and clients' },
      { value: '#10', label: 'Product of the Day on Product Hunt — CLI Manager' },
      { value: '$1,200+', label: 'early paid revenue from CLI Manager — before it went open source' },
    ],
  },
  work: {
    title: 'Work',
    intro: 'Client work at Lightsoft, and projects I took on myself.',
    labels: { before: 'Before', after: 'After', lesson: 'What I learned', results: 'Results' },
    projects: [
      {
        id: 'kits',
        context: 'Lightsoft · client KITS EDU',
        name: 'KITS',
        tagline: 'An education service from placement tests to daily study, across phone, tablet and web',
        summary:
          'Every screen fans out into the app, mobile web, desktop web, teacher web and admin web. **Matching screens with the designer and the client** was a bigger job than the code itself, so together with the designer I **rebuilt the feedback process** that kept losing items when requests were vague or piled up.',
        facts: [
          { label: 'When', value: 'Nov 2025 – present' },
          { label: 'Role', value: 'Front end & QA lead' },
          { label: 'Platforms', value: 'App · web · teacher · admin' },
          { label: 'With', value: 'Designer · developers · CEO · client' },
        ],
        cover: shot('lw_kits-hero-phones', 'Several phones showing the KITS app'),
        improvements: [
          {
            title: 'Responsive review',
            before: 'Dragging the Chrome window wider and narrower, one screen at a time',
            after: '**A review board showing 55 screens and 39 modals in portrait and landscape at once**. Each screen has a comment box, so a designer’s comment becomes a work instruction as is.',
            metric: { value: '55 / 55', label: 'tablet screens checked · 0 errors' },
          },
          {
            title: 'Sending feedback',
            before: 'Sixty text notes in a single Slack message',
            after: '**A widget that lets you point at the actual button or text on screen and report it**, added to all four apps: app, web, teacher and admin.',
            metric: { value: '41', label: 'reports the designer filed in a single day' },
          },
          {
            title: 'Tracking progress',
            before: 'A 613-line review doc updated by hand; you had to ask to know what was fixed',
            after: '**Report → internal system → Linear issue → Slack notice, all automatic**. When a fix ships, Slack gets what changed plus a link to the review board.',
            metric: { value: '301+', label: 'reports with a tracked status' },
          },
        ],
        metrics: [
          { value: '41 → 22', label: 'of 41 reports on a busy day, 22 closed within 3 hours' },
          { value: '94+', label: 'screens reviewed together on one board' },
        ],
        quotes: [
          { text: 'We could see that a lot has improved since the first round of feedback. This time there was much less to point out…', who: 'Client — second review signed off, Jul 2026' },
          { text: 'We’ve never worked with a vendor like this.', who: 'Client — during a review meeting' },
        ],
        lesson: {
          title: 'Placement beats the tool',
          body: 'Nobody opened the review board while it was a local HTML file. People only started using it once it lived at a deployed URL. Building a tool and having it used are different jobs — **it has to feel easy inside the other person’s workflow** before it convinces anyone.',
        },
        gallery: [
          shot('kits_board_top', 'Top of the review board', 'The review board — portrait and landscape captures plus a comment box for every screen'),
          shot('kits_picker_top', 'Element picking mode', '“Pick an element” mode — point at anything on screen and report it'),
          shot('kits_dp_top', 'Reports collected in the internal system', 'Reports sorted automatically by screen, content and type'),
          shot('kits_bot_crop', 'Slack notice after a fix', 'Once a fix ships, Slack gets the change and a review board link'),
        ],
      },
      {
        id: 'fair',
        context: 'Freelance contract · AX',
        name: 'FAIR HR consulting CRM/ERP',
        tagline: 'A labor law firm’s whole consulting process — diagnose, design, execute, manage change, evaluate — in one place',
        summary:
          'I worked with the labor attorneys as if we were one team. We **moved checklist-and-document manual work into software** and **shifted the consulting process to AI (AX)**. It also **checks the statutes an AI cites against the actual law**.',
        facts: [
          { label: 'When', value: 'Feb 2026 – present' },
          { label: 'Role', value: 'Planning, development and operations' },
          { label: 'Apps', value: 'CRM · public site · staff app' },
          { label: 'With', value: 'Labor attorneys · users in each role' },
        ],
        cover: shot('efm_v4', 'A frame from the FAIR product video I made'),
        improvements: [
          {
            title: 'Everything around the code',
            before: 'Outsourced development usually covers the build only',
            after: 'Contract (Mar 8) → feature spec v2–v2.2 (Apr 13–17) → admin and advisor guides (May 17–26) → design system handoff (Jun 8) → proposal, product video and card news (Jul–Sep), all done by me.',
          },
          {
            title: 'Screens for each role',
            before: 'Everyone saw the same data on the same screen',
            after: 'CEO, executives, advisors, case handlers and staff each see different data and screens. Designing that and walking the attorneys through it taught me a great deal about HR and labor work.',
          },
        ],
        metrics: [
          { value: '3', label: 'apps in production — CRM · public site · staff app' },
          { value: '1,086', label: 'commits · 164 merged PRs' },
        ],
        lesson: {
          title: 'Working solo means building in the user’s view',
          body: 'Writing the user guide exposed gaps in the screens, and making the product video forced me to **say in one sentence whose work this product reduces**, and how.',
        },
        gallery: [
          shot('efm_stages_c', 'Project stage screen', 'Stages — contract → diagnosis → design → execution → change management → evaluation'),
          shot('efm_diag_c', 'AS-IS diagnosis screen', 'AS-IS diagnosis — issues and priority by area'),
          shot('efm_kpi_c', 'Performance management screen', 'Performance management — KPI changes become approval requests'),
          shot('efm_att', 'Attendance demo on the public site', 'Attendance demo on the public site'),
        ],
      },
      {
        id: 'cli-manager',
        context: 'Personal product · open source',
        name: 'CLI Manager',
        tagline: 'A desktop app to run and organize multiple AI coding agents (CLIs) from one screen',
        summary:
          'It started with my own mess: ten terminals open and no idea which was which. **Ten months and 57 releases later it’s a public product.** I did the planning, development, releases, landing page and marketing alone — **it launched as a paid app, earned its first revenue, then went open source**.',
        facts: [
          { label: 'When', value: 'Nov 2025 – present' },
          { label: 'Role', value: 'Solo maker' },
          { label: 'Platform', value: 'macOS (Electron)' },
          { label: 'License', value: 'MIT, open source' },
        ],
        cover: shot('cli_main', 'CLI Manager main screen'),
        improvements: [
          {
            badge: 'Latest update · v1.10.0 · Sep 29, 2026',
            title: 'AI Control API',
            before: 'With non-interactive runs, you only find out an AI went off track once it’s done',
            after: 'In v1.9 (Sep 23, 2026), **a local API lets another AI open sessions and work inside CLI Manager**. AI sessions show up in green, so you can check in and step in at any time. Since v1.10 (Sep 29, 2026) the AI also reads the notes on those sessions.',
          },
        ],
        metrics: [
          { value: '#10', label: 'Product of the Day on Product Hunt · 105 upvotes' },
          { value: '57', label: 'releases in 10 months' },
          { value: '$1,200+', label: 'early paid revenue → then open source' },
          { value: '23K', label: 'views on the top Reddit post' },
        ],
        quotes: [{ text: 'I picked this up today and am obsessed!!', who: 'A Product Hunt user' }],
        lesson: {
          title: 'The cheapest QA',
          body: 'Both bugs caught in the latest update were about how things looked, not what they did. **Using my own tool every day turned out to be the cheapest QA there is**.',
        },
        gallery: [
          shot('cli_green', 'AI sessions shown in green', 'A real AI agent working inside CLI Manager — AI sessions are green'),
          shot('cli_ph', 'Product Hunt page', 'The Product Hunt page — 105 upvotes'),
          shot('cli_loop', 'Loop Dashboard', 'v1.6 Loop Dashboard'),
        ],
        links: [
          { label: 'Website', href: 'https://climanager.solhun.com' },
          { label: 'GitHub', href: 'https://github.com/woorichicken/CLI_manager' },
          { label: 'Product Hunt', href: 'https://www.producthunt.com/products/cli-manager' },
        ],
      },
      {
        id: 'automation',
        context: 'Lightsoft · internal tools',
        name: 'Internal dev automation',
        tagline: 'Symphony, a daemon that builds issues from docs and calls a person when it gets stuck — plus Lassorun, our docs and QA platform',
        summary:
          'I built it because people were babysitting recurring issues by hand — checking progress, reviewing, asking again. Symphony picks up an issue, **has AI agents build it from the docs**, and **pings a human on Slack when it’s stuck**. Docs, test cases and reports all flow through Lassorun.',
        facts: [
          { label: 'When', value: 'May 2026 – present' },
          { label: 'Role', value: 'Design, build, rollout across the team' },
          { label: 'Scope', value: 'Symphony · Lassorun · feedback widget' },
          { label: 'With', value: 'CEO · in-house developers' },
        ],
        cover: shot('sym_flow', 'Flow view in the internal docs and QA platform'),
        metrics: [
          { value: '44', label: 'comments after the demo video was shared' },
          { value: '798', label: 'Symphony commits' },
        ],
        quotes: [
          { text: 'Ultimately I’d like it to be manageable from a dashboard, even by people who aren’t developers.', who: 'CEO — demo thread, Jul 2026' },
          { text: 'Honestly I built it for internal use and barely thought about usability. I’ll work in what you said.', who: 'Me — then built a project sign-up flow on the spot' },
        ],
        lesson: {
          title: 'Sharing it with the team',
          body: 'In Feb 2026 I made “how I use AI tools” a regular session (3+ times) and presented our E2E and unit test automation workflow. In Mar 2026 I announced an idea → Slack approval → auto-publish flow, and a designer posted their first idea within 7 minutes. After the official demo in Jul 2026, Symphony went to work on the KITS teacher and admin web apps.',
        },
      },
      {
        id: 'purple',
        context: 'Lightsoft · client Purple Academy',
        name: 'Purple',
        tagline: 'Admin app for an English-learning LMS — curriculum, quizzes, classes and a reading program',
        summary:
          'An admin system handling 17 quiz types × 16 question types on live production data. Questions were locked inside quizzes and couldn’t be reused, so I redesigned it so **questions live on their own and link to quizzes** — then **verified the production data migration step by step**, from design and plan to execution.',
        facts: [
          { label: 'When', value: 'Nov 2025 – Jun 2026' },
          { label: 'Role', value: 'Admin web · data model · QA' },
          { label: 'Scope', value: 'Curriculum · quizzes · classes' },
          { label: 'With', value: 'Team lead · developers · client · designer' },
        ],
        cover: shot('pur_class', 'Purple admin class screen'),
        improvements: [
          {
            title: 'QA',
            before: 'Clicking through screens one by one to find bugs',
            after: 'A table that round-trips every type through create → read → update → delete and checks the saved values come back unchanged. I also tried an AI QA tool first and shared it; two teammates applied it to their own areas right away.',
            metric: { value: '17×16', label: 'CRUD round-trip matrix, 5 h 41 min' },
          },
        ],
        metrics: [
          { value: '6,752', label: 'quizzes migrated in production · 0 mismatches' },
          { value: '137 days', label: 'dedicated channel, through final payment' },
        ],
        lesson: {
          title: 'Speak up when scope moves',
          body: 'A task I estimated at 40 lines became 400, and I didn’t flag it early — the team lead renegotiated with the client for me. Since then I write every task as **“estimate → measured”**.',
        },
        gallery: [
          shot('pur_matrix', 'CRUD round-trip matrix', 'CRUD round-trip matrix by quiz type'),
          shot('pur_quiz', 'Quiz editor', 'Quiz editor — questions by type'),
        ],
      },
      {
        id: 'porterx',
        context: 'Lightsoft · client · on the App Store',
        name: 'PorterX',
        tagline: 'A mission-matching app that connects travelers’ routes with local shopping requests',
        summary: 'The project where I handled **the most post-launch operations** — payments, refunds, store review and security.',
        facts: [
          { label: 'When', value: 'Aug 2025 – Apr 2026' },
          { label: 'Role', value: 'App features · design · operations' },
          { label: 'Platforms', value: 'iOS · Android · admin' },
          { label: 'With', value: 'Developer · CEO · client' },
        ],
        cover: shot('ptx_home', 'PorterX home — mission matching'),
        improvements: [
          { title: 'Payments', before: 'Settlement broke every time payment gateway rules changed', after: 'Switched gateways four times, redesigned settlement, and landed on in-app purchases.' },
          { title: 'Refunds', before: 'Users spent credits and then got refunds (refund events weren’t received)', after: 'Within 3 days: a refund webhook plus automatic credit clawback.' },
          { title: 'Release', before: 'Two App Store rejections, and every fix meant another review', after: 'Moved to OTA updates so fixes no longer wait on review every time.' },
          { title: 'Security', before: 'Security gaps in code built quickly with AI agents', after: 'A full audit four months in blocked 4 critical issues.' },
        ],
        gallery: [
          shot('ptx_credit', 'Missions and credits screen', 'Missions and credits'),
          shot('ptx_comm', 'Community screen', 'Community (nicknames blurred)'),
        ],
      },
      {
        id: 'ncdigitec',
        context: 'Lightsoft · client · official Samsung partner',
        name: 'NC Digitec',
        tagline: 'Redesign of an online store for Samsung AI subscriptions (rentals)',
        summary:
          'I led the redesign and ran the loop for designer and client feedback. I set things up so **the designer could install the feedback tool on their own**, batched incoming reports, and shared what shipped as a list — “6 reports from yesterday and today, fixed”. It carried over the feedback process refined on KITS.',
        facts: [
          { label: 'When', value: 'Apr 2026 – present' },
          { label: 'Role', value: 'Redesign lead · operations' },
          { label: 'Scope', value: 'Home · products · subscription consult' },
          { label: 'With', value: 'Designer · CEO · client' },
        ],
        cover: shot('ncd_kv', 'Main key visual of the store'),
        improvements: [
          {
            title: 'Applying feedback',
            before: 'Change requests scattered across messengers and documents',
            after: 'Reports left right on the screen → fixed in batches → shared as a list of what changed',
          },
        ],
        gallery: [
          shot('ncd_ux', 'Feedback left on the screen', 'Feedback left directly on the screen (navigation bar)'),
          shot('ncd_plan', 'Care plan picker', 'Choosing a care plan'),
        ],
      },
      {
        id: 'content',
        context: 'Personal · open source',
        name: 'Content automation',
        tagline: 'A pipeline from collecting ideas to planning, producing and publishing',
        summary:
          'Collect popular posts on X → two AI agents debate the topic (up to 3 rounds) → research, fact-check, copy, render and caption → **publish to Threads, X and Instagram at once**. Every day it gathered engagement data and remade the best posts from a new angle. **I open-sourced it** with the API keys left blank.',
        facts: [
          { label: 'When', value: 'Mar – Apr 2026' },
          { label: 'Role', value: 'Design · build · operations' },
          { label: 'Channels', value: 'Threads · X · Instagram' },
          { label: 'Then', value: 'Grew into an internal content platform' },
        ],
        cover: shot('ct_coord', 'Card news made by the pipeline'),
        metrics: [
          { value: '780K', label: 'views in 3 weeks' },
          { value: '94 → 8,600', label: 'Threads followers (peak)' },
          { value: '100+', label: 'posts · 50 above 1,500 views' },
        ],
        lesson: {
          title: 'A tool the team uses',
          body: 'I presented the results in-house as “write it down, even briefly, and AI will develop it for you”. It later grew into an internal content platform with automatic card news, and **the team now uses it together**.',
        },
        gallery: [shot('cli_card', 'Card introducing CLI Manager', 'A CLI Manager intro card made with the pipeline')],
        links: [{ label: 'GitHub', href: 'https://github.com/lightsoft-dev/claude-content-pipeline' }],
      },
    ],
  },
  others: {
    title: 'More work',
    intro: 'Shorter stints, and things that have only just started.',
    items: [
      {
        slug: 'design-atlas',
        name: 'Design Atlas',
        period: 'Sep 2026 – present · personal',
        body: 'A design dictionary of **893 motion, effect, component and UX terms across 34 fields** — each with Korean and English explanations, a live demo and code.',
        shot: shot('design_atlas', 'Design Atlas home'),
        detail: {
          facts: [
            { label: 'When', value: 'Sep 2026 – present' },
            { label: 'Role', value: 'Solo maker' },
            { label: 'Size', value: '893 terms · 34 fields' },
            { label: 'Languages', value: 'Korean · English' },
          ],
          paragraphs: ['A dictionary of design terms — motion, effects, 3D, components and UX — that shows each one with Korean and English explanations, a live demo and code.'],
          links: [{ label: 'Website', href: 'https://design.solhun.com' }],
        },
      },
      {
        slug: 'switch-on',
        name: 'Switch On',
        period: 'Apr – Sep 2026',
        body: 'Porting a board game to BGA Studio · alpha and beta.',
        shot: shot('sw_board', 'Switch On game board'),
        detail: {
          facts: [
            { label: 'When', value: 'Apr – Sep 2026' },
            { label: 'Role', value: 'Port development (solo)' },
            { label: 'Built as', value: 'Next.js prototype · Board Game Arena port' },
            { label: 'With', value: 'CEO' },
          ],
          paragraphs: ['I first built the board game Switch On as a Next.js prototype, then ported it to Board Game Arena (BGA Studio) and shipped it through alpha and beta.'],
        },
      },
      {
        slug: 'dolphin-crm',
        name: 'Dolphin CRM',
        period: 'Oct 2025 – Jul 2026',
        body: 'Orders, after-sales service and stock for a dishwasher business — **restructured product data management (specs and capacities)**, simplified menus, added web analytics.',
        shot: shot('dp_stats', 'Dolphin CRM statistics'),
        detail: {
          facts: [
            { label: 'When', value: 'Oct 2025 – Jul 2026' },
            { label: 'Role', value: 'Support (a teammate was the main developer)' },
            { label: 'Scope', value: 'Admin for dishwasher orders · after-sales · stock' },
          ],
          paragraphs: [
            'Oct 2025 — built the product data management page with spec and capacity management, and simplified the product-order menu structure.',
            'Jul 2026 — added web analytics (PostHog), removed the unified search and unused collection pages, and fixed a bug in creating order products.',
          ],
        },
      },
      {
        slug: 'bigdatahub-webzine',
        name: 'Big Data Hub webzine',
        period: 'Apr – Jul 2026',
        body: 'A university program’s webzine and its admin for writers and points.',
        shot: shot('web_admin', 'Webzine admin'),
        detail: {
          facts: [
            { label: 'When', value: 'Apr – Jul 2026' },
            { label: 'Scope', value: 'Webzine · admin for writers and points' },
            { label: 'With', value: 'A program team of 4' },
          ],
          paragraphs: ['Built as a team: the webzine of a university big-data program and the admin that manages its writers and points.'],
        },
      },
      {
        slug: 'light-archive',
        name: 'light-archive',
        period: 'Feb – Sep 2026',
        body: 'Internal knowledge and blog platform, archive.lightsoft.dev.',
        shot: shot('la_home', 'light-archive home'),
        detail: {
          facts: [
            { label: 'When', value: 'Feb – Sep 2026' },
            { label: 'Role', value: 'Development' },
            { label: 'With', value: 'CEO · designer' },
          ],
          paragraphs: ['Our internal knowledge-sharing and blog platform. I handled development, and built the first card-news prototype here.'],
          links: [{ label: 'Website', href: 'https://archive.lightsoft.dev' }],
        },
      },
      {
        slug: 'motion-meme',
        name: 'Motion Meme',
        period: 'Mar 2026 · 2nd at internal hackathon',
        body: 'MVP of a social platform built around meme challenges.',
        shot: shot('lw_motion', 'Motion Meme screen'),
        detail: {
          facts: [
            { label: 'When', value: 'Mar 2026 (hackathon)' },
            { label: 'Team', value: 'Lightsoft' },
            { label: 'Result', value: '2nd at internal hackathon' },
          ],
          paragraphs: ['An MVP of a social platform built around meme challenge videos. It includes reporting, blocking, an admin, credits and payment logic — enough to actually operate.'],
          links: [{ label: 'Demo', href: 'https://motion-meme-mvp-j1rv.vercel.app' }],
        },
      },
      {
        slug: 'youtube-manager',
        name: 'YouTube Manager',
        period: 'Mar – Aug 2026',
        body: 'Joined during production to help build another company’s system.',
        shot: shot('yt_plan', 'YouTube Manager planning screen'),
        detail: {
          facts: [
            { label: 'When', value: 'Mar – Aug 2026' },
            { label: 'With', value: '2 developers' },
            { label: 'Built as', value: 'pnpm · Turborepo monorepo · Cloudflare D1 · Better Auth' },
          ],
          paragraphs: ['AutoTube, a service for managing YouTube video production from planning to Shorts. I joined during production, working with two teammates.'],
        },
      },
      {
        slug: 'lightsoft-web',
        name: 'Lightsoft website',
        period: 'Oct 2025 – present · in-house',
        body: 'The company site and work showcase.',
        shot: shot('lw_work-1', 'Work section of the Lightsoft site'),
        detail: {
          facts: [
            { label: 'When', value: 'Oct 2025 – present' },
            { label: 'Role', value: 'Initial setup support' },
          ],
          paragraphs: ['The official company site and work showcase. I helped with the initial setup; teammates have mostly looked after it since.'],
        },
      },
    ],
    contestsTitle: 'Competitions',
    contests: 'AI TOP 100 (finals and campus) · Litmers vibe-coding contest · Kakao PlayMCP · DataHub hackathon · a Ministry of Government Legislation contest proposal',
  },
  early: {
    title: 'Before Lightsoft',
    intro: '2024–2025: things that started from small frustrations around me.',
    items: [
      {
        slug: 'debatetimer',
        name: 'DebateTimer.org',
        tag: 'Personal',
        body: 'The first service I built, for my debate club. Once I added each school’s own debate format — Myongji’s “visual” style, Sungshin’s “Todallae” style — **it spread to clubs at other universities**.',
        shot: shot('dt_templates', 'Template picker for each school’s debate format'),
        detail: {
          facts: [
            { label: 'When', value: 'Mar – Oct 2025' },
            { label: 'Role', value: 'Development (with 1 collaborator)' },
            { label: 'Stack', value: 'Next.js · Supabase' },
            { label: 'Result', value: 'Live on its own domain · search traffic' },
          ],
          paragraphs: ['It went public on debatetimer.org in March 2025 and ran as a live service that people found through search.'],
        },
      },
      {
        slug: 'praynie',
        name: 'PrayNie',
        tag: 'Personal',
        body: 'An AI prayer-topic platform to make collecting and sharing prayer requests easier for a campus ministry. It never became a mainstream service — my first lesson that **building something and getting it used are different things**.',
        shot: shot('pray_mock', 'PrayNie landing page'),
        detail: {
          facts: [
            { label: 'When', value: 'Apr 2025' },
            { label: 'Role', value: 'Solo developer' },
            { label: 'Stack', value: 'React · Supabase' },
          ],
          paragraphs: ['AI suggests prayer topics, and a social-style feed lets people respond to each other’s requests.'],
        },
      },
      {
        slug: 'ddingsroom',
        name: 'Ddingsroom',
        tag: 'University · contest',
        body: 'A study-room booking service for Myongji University’s student center. I was on the back-end team; after it won an award at the Creative SW contest, **it became an official university service**.',
        shot: shot('dd_live', 'Ddingsroom booking screen, still in service'),
        metrics: [
          { value: '851', label: 'sign-ups' },
          { value: '4,261', label: 'bookings' },
        ],
        note: 'As of Apr 2026',
        detail: {
          facts: [
            { label: 'When', value: 'May – Jul 2025' },
            { label: 'Role', value: 'Back end (admin module)' },
            { label: 'With', value: 'A team of 4' },
            { label: 'Result', value: 'Encouragement Award, 4th Creative SW Program Contest' },
          ],
          paragraphs: ['I joined the capstone team on the back end and owned the admin module. The team aligned on screen designs and the ERD together as we went.'],
        },
      },
    ],
    devhoon: {
      name: 'DEV HOON',
      tag: 'Student dev team · since Apr 2024',
      body: 'With friends from school I took on client work under the name “DEV HOON”. I led planning and development, and every Kmong review was 5.0. Our first client was a labor law firm: it began with a website rebuild in January 2025 and grew into an admin tool where AI fills in SEO metadata.',
      history: [
        { date: '2025.01', text: 'FAIR website rebuild' },
        { date: '2025.02', text: 'AI SEO content management — notices and newsletter' },
        { date: '2025.09', text: 'Campaign page for a life insurance social contribution foundation — still live' },
        { date: 'Other', text: 'Small client jobs and design work that can’t be shown (branding, promo materials)' },
      ],
      shots: [
        shot('early_devhoon-fairhr-website-2025-mockup', 'FAIR website home (2025)', 'FAIR website home (2025) — our first client'),
        shot('early_kmong-fair-devhoon-profile', 'Kmong seller profile', 'Kmong seller profile “DEV HOON, student dev team” · 5.0 reviews'),
      ],
    },
  },
  timeline: {
    title: 'Timeline',
    items: [
      { date: '2024.04', text: 'Started the student dev team DEVHOON' },
      { date: '2025.01', text: 'First client: FAIR HR website rebuild · freelance on Kmong (5.0 reviews)' },
      { date: '2025.03', text: 'DebateTimer.org · PrayNie' },
      { date: '2025.06', text: 'Ddingsroom (team, back end) — award at Myongji’s Creative SW contest' },
      { date: '2025.10', text: 'Joined Lightsoft' },
      { date: '2025.11', text: 'Started KITS, PorterX and Purple · released CLI Manager (Product Hunt #10 in December)' },
      { date: '2026.02', text: 'FAIR CRM/ERP contract · internal knowledge platform light-archive' },
      { date: '2026.03', text: 'Content automation (780K views in 3 weeks) · YouTube Manager · Motion Meme (2nd at internal hackathon) · AI TOP 100' },
      { date: '2026.04', text: 'NC Digitec Samsung subscription store · Dolphin CRM · Switch On · Big Data Hub webzine' },
      { date: '2026.07', text: 'Symphony internal demo · Kakao PlayMCP entry' },
      { date: '2026.08', text: 'Lassorun (docs & QA platform) · feedback widget · report → Linear → Slack' },
      { date: '2026.09', text: 'Content platform · CLI Manager v1.10 · Design Atlas' },
    ],
  },
  awards: {
    title: 'Awards & activities',
    items: [
      { date: '2025.10', title: 'Encouragement Award, 4th Creative SW Program Contest', org: 'Myongji University', body: 'Ddingsroom, a study-room booking service — back end. It later became an official university service.' },
      { date: '2025.12', title: 'Product Hunt #10 Product of the Day', org: 'Product Hunt', body: 'CLI Manager, 105 upvotes.' },
      { date: '2026.02', title: 'Internal talk — AI-based test automation workflow', org: 'Lightsoft', body: 'Presented our E2E and unit test automation workflow with real examples.' },
      { date: '2026.03', title: '2nd place, internal hackathon', org: 'Lightsoft', body: 'Motion Meme, an MVP of a social platform built around meme challenges.' },
      { date: '2026.07', title: 'Entry, Kakao PlayMCP contest', org: 'Kakao', body: 'World of AgentCraft, a game server where AI agents run a settlement through MCP tools.' },
    ],
  },
  contact: {
    title: 'Contact',
    body: 'If you’d like to work together, email is the best way to reach me.',
    email: 'solhun.jeong@gmail.com',
    links: [
      { label: 'GitHub', href: 'https://github.com/woorichicken' },
      { label: 'Threads', href: 'https://www.threads.com/@aisolutiondev' },
    ],
    closing: 'I want to keep exploring the whole process — and keep fixing what I find along the way.',
  },
  detail: { more: 'View details', back: 'Back to the full portfolio' },
  footer: { note: 'Personal details in screenshots are blurred; client data shown is demo data.' },
  feedback: {
    title: 'Feedback mode',
    hint: 'Enter the password to show the feedback button in this browser.',
    placeholder: 'Password',
    submit: 'Turn on',
    cancel: 'Close',
    wrong: 'That password doesn’t match. Try again.',
  },
};

export default en;
