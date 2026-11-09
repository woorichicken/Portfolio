// 올린 사진의 가로·세로를 파일 머리에서 읽는다(PNG · JPEG · WebP · GIF). 영상·모르는 형식은 null.
// 왜 서버에서 읽나: Shot 에는 width·height 가 꼭 있어야 하고(next/image 가 자리를 미리 잡는다), 사람이 손으로 적으면 틀린다.

export function imageSize(bytes: Uint8Array): { width: number; height: number } | null {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const ascii = (o: number, n: number) => String.fromCharCode(...bytes.subarray(o, o + n));
  // PNG: 8바이트 서명 뒤 IHDR 의 가로·세로(빅엔디언)
  if (bytes.length > 24 && bytes[0] === 0x89 && ascii(1, 3) === 'PNG') return { width: dv.getUint32(16), height: dv.getUint32(20) };
  // GIF: 6바이트 서명 뒤 리틀엔디언 16비트
  if (bytes.length > 10 && ascii(0, 3) === 'GIF') return { width: dv.getUint16(6, true), height: dv.getUint16(8, true) };
  // WebP: RIFF....WEBP 다음 청크 종류에 따라
  if (bytes.length > 30 && ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP') {
    const chunk = ascii(12, 4);
    if (chunk === 'VP8X') return { width: 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16)), height: 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16)) };
    if (chunk === 'VP8 ') return { width: dv.getUint16(26, true) & 0x3fff, height: dv.getUint16(28, true) & 0x3fff };
    if (chunk === 'VP8L') {
      const b = dv.getUint32(21, true);
      return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
    }
    return null;
  }
  // JPEG: SOF 마커(C0~CF, C4·C8·CC 제외)를 찾는다
  if (bytes.length > 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let o = 2;
    while (o + 9 < bytes.length) {
      if (bytes[o] !== 0xff) return null;
      const marker = bytes[o + 1];
      const len = dv.getUint16(o + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { width: dv.getUint16(o + 7), height: dv.getUint16(o + 5) };
      o += 2 + len;
    }
  }
  return null;
}

/** 파일 이름을 R2 키에 쓸 수 있게 — 한글·공백은 하이픈으로(오브젝트 키에 유니코드를 넣지 않는다), 남는 게 없으면 file */
export function safeMediaName(name: string): string {
  const s = name.normalize('NFC').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
  return s || 'file';
}
