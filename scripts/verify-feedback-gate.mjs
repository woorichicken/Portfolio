// 피드백 관문 검사 — 문자열을 맞춰보지 않고 src/lib/feedback-gate.ts 의 함수를 실제로 실행해 판정한다.
// (정규식 검사는 `|| true` 같은 느슨함을 통과시킨다.)
// 실행: pnpm verify:feedback-gate   (Node 22.18+ 는 .ts 를 그대로 import 한다)
import { readFileSync } from 'node:fs';

const gate = await import('../src/lib/feedback-gate.ts');

const mustAllow = ['solhun.com', 'www.solhun.com', 'localhost', 'portfolio-sage-five-xdfwq9lj38.vercel.app'];
const mustBlock = ['evil.com', 'solhun.com.evil.com', 'xsolhun.com', 'other-project.vercel.app', '127.0.0.1', ''];

const failures = [];
for (const h of mustAllow) if (!gate.isFeedbackHost(h)) failures.push(`허용돼야 하는데 막힘: ${h}`);
for (const h of mustBlock) if (gate.isFeedbackHost(h)) failures.push(`막혀야 하는데 허용됨: ${h}`);

// 비밀번호 원문이 로컬에 있으면 해시가 맞는지도 본다(원문은 저장소에 없다).
const pwPath = `${process.env.HOME}/.config/portfolio/feedback-password.txt`;
try {
  const pw = readFileSync(pwPath, 'utf8');
  if (!(await gate.isCorrectPassword(pw))) failures.push('저장된 비밀번호가 번들 해시와 맞지 않음');
  if (await gate.isCorrectPassword(pw.trim() + 'x')) failures.push('틀린 비밀번호가 통과함');
} catch {
  console.log(`(비밀번호 파일 없음 — 해시 검사 생략: ${pwPath})`);
}

if (failures.length) {
  console.error('피드백 관문 검사 실패:\n- ' + failures.join('\n- '));
  process.exit(1);
}
console.log(`피드백 관문 검사 통과 — 허용 ${mustAllow.length} · 차단 ${mustBlock.length}`);
