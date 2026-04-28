/** 카카오 주소 검색 API 호출 훅 (TODO-DB: Supabase 연동 후 정리) */
import { useCallback, useRef, useState } from 'react';

/** 카카오 주소 검색 결과 1건 */
export type KakaoAddressResult = {
  /** 도로명 주소 (없으면 지번 주소) */
  addressName: string;
  /** 법정동코드 10자리 (앞5: sigunguCd, 뒤5: bjdongCd) */
  bCode: string;
  /** 본번 (4자리 zero-pad) */
  bun: string;
  /** 부번 (4자리 zero-pad) */
  ji: string;
};

type KakaoAddress = {
  address_name?: string;
  b_code?: string;
  main_address_no?: string;
  sub_address_no?: string;
};

type KakaoRoadAddress = {
  address_name?: string;
};

type KakaoDoc = {
  address?: KakaoAddress | null;
  road_address?: KakaoRoadAddress | null;
};

type KakaoResponse = {
  documents?: KakaoDoc[];
};

const API_URL = process.env.EXPO_PUBLIC_SUPABASE_URL + '/functions/v1/kakao-address';

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function toKakaoResponse(json: unknown): KakaoResponse {
  if (!isObject(json)) return {};
  const documents = json.documents;
  if (!Array.isArray(documents)) return {};
  return { documents: documents as KakaoDoc[] };
}

/** 카카오 주소 검색 훅: query 변경 시 300ms 디바운스 후 API 호출 */
export function useKakaoAddress() {
  const [results, setResults] = useState<KakaoAddressResult[]>([]);
  const [searching, setSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** 검색어 변경 시 호출 — 300ms 디바운스 */
  const search = useCallback((query: string) => {
    // 이전 타이머 취소
    if (timerRef.current) clearTimeout(timerRef.current);

    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }

    timerRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: q }),
        });
        const jsonUnknown: unknown = await res.json();
        const json = toKakaoResponse(jsonUnknown);
        const docs: KakaoAddressResult[] = (json.documents ?? [])
          .filter((doc) => doc.address !== null && doc.address !== undefined)
          .slice(0, 5)
          .map((doc) => {
            const addr = doc.address ?? null;
            const road = doc.road_address ?? null;
            // 본번/부번: 4자리 zero-pad
            const mainNo = String(addr?.main_address_no ?? '0').padStart(4, '0');
            const subNo = String(addr?.sub_address_no ?? '0').padStart(4, '0');
            return {
              addressName: road?.address_name ?? addr?.address_name ?? '',
              bCode: String(addr?.b_code ?? ''),
              bun: mainNo,
              ji: subNo,
            };
          });
        setResults(docs);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  /** 결과 초기화 */
  const clear = useCallback(() => setResults([]), []);

  return { results, searching, search, clear };
}

