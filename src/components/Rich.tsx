// 콘텐츠 문자열의 **강조** 표시를 <strong> 으로 바꾼다.
// 마크다운 전체가 아니라 굵게 하나만 받는다 — 번역 파일에 HTML 을 넣지 않기 위해서다.
export default function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split('**').map((part, i) =>
        // 홀수 번째 조각이 ** 사이에 있던 글자다
        i % 2 === 1 ? <strong key={i} className="hl">{part}</strong> : part,
      )}
    </>
  );
}

/** 메타 설명처럼 표시를 못 쓰는 곳에 넣을 때 */
export function plain(text: string): string {
  return text.replaceAll('**', '');
}
