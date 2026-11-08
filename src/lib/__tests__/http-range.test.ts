import { describe, expect, it } from 'vitest';
import { parseRange, resolveRange } from '../http-range';

describe('Range — 실제로 보낼 구간(수정 1회차 P2c)', () => {
  it('끝이 크기를 넘으면 파일 끝까지로 줄인다', () => {
    expect(resolveRange(parseRange('bytes=0-99')!, 10)).toEqual({ offset: 0, length: 10 });
  });
  it('보통 구간 · 열린 끝 · 뒤에서 n바이트', () => {
    expect(resolveRange(parseRange('bytes=2-5')!, 10)).toEqual({ offset: 2, length: 4 });
    expect(resolveRange(parseRange('bytes=7-')!, 10)).toEqual({ offset: 7, length: 3 });
    expect(resolveRange(parseRange('bytes=-4')!, 10)).toEqual({ offset: 6, length: 4 });
    expect(resolveRange(parseRange('bytes=-40')!, 10)).toEqual({ offset: 0, length: 10 });
  });
  it('채울 수 없는 구간은 null(416)', () => {
    expect(resolveRange(parseRange('bytes=10-')!, 10)).toBeNull();
    expect(resolveRange(parseRange('bytes=5-2')!, 10)).toBeNull();
    expect(resolveRange(parseRange('bytes=-0')!, 10)).toBeNull();
  });
  it('모르는 모양은 Range 없음으로', () => {
    expect(parseRange('bytes=0-1,5-6')).toBeUndefined();
    expect(parseRange('items=0-1')).toBeUndefined();
    expect(parseRange(null)).toBeUndefined();
  });
});
