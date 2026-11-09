// HTTP Range(한 구간만) — /media/* 가 쓴다. 순수 함수라 유닛 테스트가 바로 부른다(src/lib/__tests__/http-range.test.ts).

export type RangeRequest = { offset: number; end?: number } | { suffix: number };

/** "bytes=100-199" · "bytes=100-" · "bytes=-500" 만 받는다(여러 구간·다른 단위는 무시 → 전체를 준다) */
export function parseRange(header: string | null): RangeRequest | undefined {
  const m = header?.match(/^bytes=(\d*)-(\d*)$/);
  if (!m || (!m[1] && !m[2])) return undefined;
  if (!m[1]) return { suffix: Number(m[2]) };
  return m[2] ? { offset: Number(m[1]), end: Number(m[2]) } : { offset: Number(m[1]) };
}

/**
 * 파일 크기에 맞춰 실제로 보낼 구간. 끝이 크기를 넘으면 잘라 낸다(RFC 9110 14.1.2) — 헤더도 이 값으로 적어야 본문과 맞는다.
 * 시작이 파일 끝을 넘거나 끝이 시작보다 앞이면 null(→ 416). 수정 1회차 P2c: 예전에는 요청한 길이를 그대로 헤더에 적었다.
 */
export function resolveRange(range: RangeRequest, size: number): { offset: number; length: number } | null {
  if ('suffix' in range) {
    if (range.suffix === 0 || size === 0) return null;
    const length = Math.min(size, range.suffix);
    return { offset: size - length, length };
  }
  if (range.offset >= size) return null;
  const last = Math.min(range.end ?? size - 1, size - 1);
  if (last < range.offset) return null;
  return { offset: range.offset, length: last - range.offset + 1 };
}
