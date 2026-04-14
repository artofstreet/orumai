import type { Property } from '@/types';
import { Platform } from 'react-native';

// 광고문구 3종 결과 타입
export type AdCopyResult = {
  naver: string;  // 네이버 부동산용 상세 설명
  kakao: string;  // 카카오톡 채널용 짧은 카드
  sns: string;    // 인스타그램/SNS 감성 카피
};

// 매물 정보를 한국어 요약 문자열로 변환
const buildPropertySummary = (p: Property): string => {
  const lines: string[] = [
    `매물종류: ${p.type}`,
    `거래유형: ${p.deal} ${p.price}`,
    `위치: ${p.addr}`,
    `면적: ${p.area}`,
    `층수: ${p.floor}${p.totalFloors ? ` / 총 ${p.totalFloors}` : ''}`,
    p.dir        ? `방향: ${p.dir}`             : '',
    p.moveInDate ? `입주일: ${p.moveInDate}`     : '',
    p.parking    ? `주차: ${p.parking}`          : '',
    p.heating    ? `난방: ${p.heating}`          : '',
    p.builtYear  ? `건축연도: ${p.builtYear}`    : '',
    p.memo       ? `메모: ${p.memo}`             : '',
  ];
  return lines.filter(Boolean).join('\n');
};

export async function generateAdCopy(property: Property): Promise<AdCopyResult> {
  const summary = buildPropertySummary(property);

  const userPrompt = `아래 매물 정보를 바탕으로 광고문구 3종을 작성해주세요.

[매물 정보]
${summary}

반드시 아래 JSON 형식만 반환하세요 (마크다운, 설명 없이):
{
  "naver": "네이버 부동산용 상세 설명 (200자 내외, 줄바꿈 허용)",
  "kakao": "카카오톡 채널용 짧은 카드 메시지 (80자 이내, 이모지 포함)",
  "sns": "인스타그램/SNS용 감성 카피 (100자 내외, 해시태그 3개 포함)"
}`;

  // 응답 타입 정의 (any 금지)
  type ClaudeResponse = { content: Array<{ type: string; text: string }> };
  let data: ClaudeResponse;

  if (Platform.OS === 'web') {
    // 웹: 서버 라우트 경유 (CORS 방지 + API 키 보호)
    const res = await fetch('/api/generate-ad-copy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userPrompt }),
    });
    if (!res.ok) throw new Error(`서버 라우트 오류: ${res.status}`);
    data = await res.json() as ClaudeResponse;
  } else {
    // TODO-SECURITY: 네이티브에서 직접 호출 시 API 키가 노출될 수 있으니, 서버 라우트 경유로 통일 검토
    // 네이티브(앱): 직접 호출 유지
    const apiKey = process.env.EXPO_PUBLIC_CLAUDE_API_KEY ?? '';
    if (!apiKey) throw new Error('EXPO_PUBLIC_CLAUDE_API_KEY 환경변수가 없습니다.');
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: '당신은 대한민국 부동산 전문 카피라이터입니다. 매물 정보를 받아 채널에 맞는 광고문구를 JSON으로만 반환합니다.',
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });
    if (!res.ok) throw new Error(`Claude API 오류: ${res.status}`);
    data = await res.json() as ClaudeResponse;
  }

  const raw = data.content.find((b) => b.type === 'text')?.text ?? '{}';
  const cleaned = raw.replace(/```json|```/g, '').trim(); // 마크다운 펜스 제거
  try {
    const parsed = JSON.parse(cleaned) as AdCopyResult;
    return parsed;
  } catch {
    throw new Error('광고문구 생성 실패');
  }
}