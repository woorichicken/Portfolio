import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache';
import memoryQueue from '@opennextjs/cloudflare/overrides/queue/memory-queue';
import d1NextTagCache from '@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache';

// 페이지는 한 번 그려 R2 에 두고(incremental cache), 어드민·API 가 저장하면 그 페이지의 태그만 무효로 만든다(D1 tag cache).
// 그다음 요청이 D1 에서 새로 읽어 다시 그린다. 시간 기반 재검증은 쓰지 않지만 OpenNext 가 큐를 요구해서 memory queue 를 둔다.
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  tagCache: d1NextTagCache,
  queue: memoryQueue,
});
