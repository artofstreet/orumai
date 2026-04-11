import { ExpoRequest, ExpoResponse } from 'expo-router/server';

/** 클라이언트 POST 본문: 광고문구 생성에 쓸 프롬프트 */
interface GenerateAdCopyBody {
  prompt: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseGenerateAdCopyBody(value: unknown): GenerateAdCopyBody | null {
  if (!isRecord(value) || typeof value.prompt !== 'string') {
    return null;
  }
  return { prompt: value.prompt };
}

// 서버 전용 라우트 — CLAUDE_API_KEY는 번들/클라이언트에 포함되지 않음
export async function POST(request: ExpoRequest): Promise<ExpoResponse> {
  const apiKey = process.env.CLAUDE_API_KEY ?? '';
  if (!apiKey) {
    return ExpoResponse.json({ error: 'API 키 없음' }, { status: 500 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return ExpoResponse.json({ error: '잘못된 JSON' }, { status: 400 });
  }

  const body = parseGenerateAdCopyBody(rawBody);
  if (!body) {
    return ExpoResponse.json({ error: 'prompt 필드가 필요합니다' }, { status: 400 });
  }

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
      system:
        '당신은 대한민국 부동산 전문 카피라이터입니다. 매물 정보를 받아 채널에 맞는 광고문구를 JSON으로만 반환합니다.',
      messages: [{ role: 'user', content: body.prompt }],
    }),
  });

  let rawData: unknown;
  try {
    rawData = await res.json();
  } catch {
    return ExpoResponse.json({ error: '응답 파싱 실패' }, { status: 502 });
  }

  if (!res.ok) {
    return ExpoResponse.json(
      typeof rawData === 'object' && rawData !== null ? rawData : { error: 'Anthropic API 오류' },
      { status: res.status }
    );
  }

  // 성공 시 Anthropic 응답 JSON 전체(id, model, content 등)를 그대로 반환
  if (typeof rawData !== 'object' || rawData === null) {
    return ExpoResponse.json({ error: '예상하지 못한 응답 형식' }, { status: 502 });
  }
  return ExpoResponse.json(rawData as Record<string, unknown>);
}
