import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS 헤더 (웹에서 호출 가능하도록)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // CORS preflight 처리
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { sigunguCd, bjdongCd, bun, ji } = await req.json();

    // 필수 파라미터 검증
    if (!sigunguCd || !bjdongCd) {
      return new Response(
        JSON.stringify({ error: "sigunguCd, bjdongCd는 필수입니다" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 환경변수에서 국토부 API 키 가져오기
    const serviceKey = Deno.env.get("BUILDING_API_KEY") ?? "";
    if (!serviceKey) {
      return new Response(
        JSON.stringify({ error: "서버에 API 키가 설정되지 않았습니다" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const toNumber = (value: unknown, fallback = 0): number => {
      if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
      if (typeof value === "string") {
        const n = Number(value);
        return Number.isFinite(n) ? n : fallback;
      }
      return fallback;
    };

    // 국토부 건축물대장 표제부 API 호출 (기존 유지)
    const titleUrl =
      `http://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo?serviceKey=${serviceKey}&sigunguCd=${sigunguCd}&bjdongCd=${bjdongCd}&bun=${bun || "0000"}&ji=${ji || "0000"}&_type=json&numOfRows=100`;

    // 국토부 건축물대장 총괄표제부 API 호출 (추가)
    const recapUrl =
      `http://apis.data.go.kr/1613000/BldRgstHubService/getBrRecapTitleInfo?serviceKey=${serviceKey}&sigunguCd=${sigunguCd}&bjdongCd=${bjdongCd}&bun=${bun || "0000"}&ji=${ji || "0000"}&_type=json&numOfRows=100`;

    // 두 API를 동시에 호출하여 속도 최적화
    const titlePromise = fetch(titleUrl).then((res) => res.json());
    const recapPromise = (async () => {
      try {
        const res = await fetch(recapUrl);
        return await res.json();
      } catch {
        // 총괄표제부 실패해도 표제부는 정상 반환되어야 함
        return null;
      }
    })();

    const [data, recapData] = await Promise.all([titlePromise, recapPromise]);

    // 응답에서 건물 정보 추출
    const items = data?.response?.body?.items?.item;
    if (!items) {
      return new Response(
        JSON.stringify({ error: "건물 정보를 찾을 수 없습니다", raw: data }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 배열 또는 단일 객체 처리
    const buildingList = Array.isArray(items) ? items : [items];

    // 오름AI에서 사용할 필드만 추출
    const results = buildingList.map((item: Record<string, unknown>) => ({
      buildingName: item.bldNm ?? "", // 건물명
      totalArea: item.totArea ?? 0, // 연면적(공급면적)
      grndFlrCnt: item.grndFlrCnt ?? 0, // 지상층수(총층)
      ugrndFlrCnt: item.ugrndFlrCnt ?? 0, // 지하층수
      useAprDay: item.useAprDay ?? "", // 사용승인일(준공일)
      strctCdNm: item.strctCdNm ?? "", // 구조
      mainPurpsCdNm: item.mainPurpsCdNm ?? "", // 주용도
      dongNm: item.dongNm ?? "", // 동명칭
    }));

    const recap = (() => {
      if (!recapData) return null;

      const responseObj = (recapData as Record<string, unknown>).response as
        | Record<string, unknown>
        | undefined;
      const body = responseObj?.body as Record<string, unknown> | undefined;
      const itemsObj = body?.items as Record<string, unknown> | undefined;
      const item = itemsObj?.item as unknown;
      if (!item) return null;

      const recapItem = (Array.isArray(item) ? item[0] : item) as Record<string, unknown>;
      return {
        totPkngCnt: toNumber(recapItem.totPkngCnt), // 총주차수
        hhldCnt: toNumber(recapItem.hhldCnt), // 세대수
        totArea: toNumber(recapItem.totArea), // 연면적
        vlRat: toNumber(recapItem.vlRat), // 용적률
      };
    })();

    return new Response(
      JSON.stringify({ buildings: results, recap }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
