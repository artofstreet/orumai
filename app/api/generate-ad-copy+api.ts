import { ExpoRequest } from 'expo-router/server';

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
  const prompt = value.prompt.trim();
  if (!prompt) return null;
  return { prompt };
}

// 서버 전용 라우트 — CLAUDE_API_KEY는 번들/클라이언트에 포함되지 않음
export async function POST(request: ExpoRequest | undefined): Promise<Response> {
  if (!request) {
    return new Response(JSON.stringify({ error: 'request 없음' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const apiKey = (process.env.CLAUDE_API_KEY ?? '').trim();
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API 키 없음' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // json() 소비 실패 시에도 본문을 읽을 수 있도록 미리 복제
  const bodyBackup = request.clone();
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    try {
      const text = await bodyBackup.text();
      if (!text.trim()) {
        return new Response(JSON.stringify({ error: '요청 본문이 비어 있습니다' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      rawBody = JSON.parse(text) as unknown;
    } catch {
      return new Response(JSON.stringify({ error: '요청 본문을 JSON으로 파싱할 수 없습니다' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  const body = parseGenerateAdCopyBody(rawBody);
  if (!body) {
    return new Response(JSON.stringify({ error: 'prompt 필드가 필요합니다' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let res: Response | undefined;
  // Claude API 호출 타임아웃(15초) — 무한 대기 방지
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15_000);
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system:
          '당신은 대한민국 부동산 전문 카피라이터입니다. 매물 정보를 받아 채널에 맞는 광고문구를 JSON으로만 반환합니다.',
        messages: [{ role: 'user', content: body.prompt }],
      }),
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Claude API 연결 실패' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (res == null) {
    return new Response(JSON.stringify({ error: 'Claude API 연결 실패' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let rawData: unknown;
  try {
    rawData = await res.json();
  } catch {
    return new Response(JSON.stringify({ error: '응답 파싱 실패' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!res.ok) {
    return new Response(
      JSON.stringify(
        typeof rawData === 'object' && rawData !== null ? rawData : { error: 'Anthropic API 오류' }
      ),
      { status: res.status, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 성공 시 Anthropic 응답 JSON 전체(id, model, content 등)를 그대로 반환
  if (typeof rawData !== 'object' || rawData === null) {
    return new Response(JSON.stringify({ error: '예상하지 못한 응답 형식' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response(JSON.stringify(rawData as Record<string, unknown>), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
