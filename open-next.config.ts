import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache';
import { withRegionalCache } from '@opennextjs/cloudflare/overrides/incremental-cache/regional-cache';
import memoryQueue from '@opennextjs/cloudflare/overrides/queue/memory-queue';
import d1NextTagCache from '@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache';

// 그려 둔 페이지가 머무는 시간(초). 이 시간이 지나면 그 데이터센터는 R2 에서 다시 읽는다.
const REGIONAL_CACHE_TTL_SECONDS = 60 * 60;

// 페이지는 한 번 그려 R2 에 두고(incremental cache), 어드민·API 가 저장하면 그 페이지의 태그만 무효로 만든다(D1 tag cache).
// 그다음 요청이 D1 에서 새로 읽어 다시 그린다. 시간 기반 재검증은 쓰지 않지만 OpenNext 가 큐를 요구해서 memory queue 를 둔다.
//
// R2 버킷은 아시아(APAC)에 있고 접속 데이터센터는 그날 경로에 따라 LAX·HKG·NRT 로 갈린다. 그래서 그려 둔 페이지를
// 접속한 데이터센터의 Cache API 에도 한 벌 둔다(regional cache). 그러면 바다 건너 R2 를 읽지 않는다.
// 태그 확인(D1)은 그대로 한다 — Next 16 에서 OpenNext 기본값이 bypassTagCacheOnCacheHit=false 라서, 어드민 저장은 전처럼 바로 반영된다.
// 저장하면 각 데이터센터가 다음 요청에서 태그를 보고 한 번씩 다시 그린다. 어드민·API 를 거치지 않고 D1 을 직접 고치면
// revalidatePath 가 안 불려 데이터센터마다 최대 1시간 옛 페이지가 나간다(R2 만 쓰던 때도 옛 페이지가 남았다).
export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(r2IncrementalCache, {
    mode: 'long-lived',
    defaultLongLivedTtlSec: REGIONAL_CACHE_TTL_SECONDS,
  }),
  tagCache: d1NextTagCache,
  queue: memoryQueue,
});
