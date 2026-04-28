// 오름AI 공통 타입 정의 — 수정 시 colors.ts BADGE_COLORS와 PropertyType 동기화 필수

// 매물 종류(= 뱃지 키) — `colors.ts`의 BADGE_COLORS "매물 종류"와 반드시 동일해야 함
export const PROPERTY_TYPES = [
  '아파트',
  '빌라',
  '원룸',
  '투룸',
  '오피스텔',
  '상가',
  '사무실',
  '단독주택',
] as const;
export type PropertyType = typeof PROPERTY_TYPES[number];

// 거래 유형(= 뱃지 키) — `colors.ts`의 BADGE_COLORS "거래 유형"과 동일해야 함
export const DEAL_TYPES = ['매매', '전세', '월세'] as const;
export type DealType = typeof DEAL_TYPES[number];

// 매물 정보(Property)
export type Property = {
  // 매물 고유 아이디
  id: string;
  // 매물 종류
  type: PropertyType;
  // 매물명
  name: string;
  // 건물명(없으면 title로 대체 표시)
  buildingName?: string;
  // 주소(지역/번지 등)
  addr: string;
  // 거래유형(매매/전세/월세)
  deal: DealType;
  // 가격(표시용 문자열)
  price: string;
  // 매매가(선택) - 정렬/필터/AI 파싱 대비
  salePrice?: number;
  // 전세금(선택) - 정렬/필터/AI 파싱 대비
  jeonsePrice?: number;
  // 보증금(월세, 선택) - 정렬/필터/AI 파싱 대비
  deposit?: number;
  // 월세(선택) - 정렬/필터/AI 파싱 대비
  monthly?: number;
  // 면적(예: 84㎡)
  area: string;
  // 면적(㎡) 숫자값(선택) - 평수 계산용
  areaM2?: number;
  // 공급면적(예: 112㎡)
  supplyArea?: string;
  // 공급면적(㎡) 숫자값(선택) - 평수 계산용
  supplyAreaM2?: number;
  // 층수(예: 25층)
  floor: string;
  // 층수 숫자값(선택)
  floorNumber?: number;
  // 방향(선택)
  dir?: string;
  // 입주일(선택, 예: 즉시입주 / 2026-05-01)
  moveInDate?: string;
  // 총층수(선택, 예: 35층)
  totalFloors?: number;
  // 건축연도(선택, 예: 2015년)
  builtYear?: number;
  // 주차(선택, 예: 1대)
  parking?: string;
  // 난방방식(선택, 예: 지역난방)
  heating?: string;
  // 집주인명(선택)
  ownerName?: string;
  // 집주인메모(선택)
  ownerMemo?: string;
  // 집주인 관계(선택, 예: 본인/배우자/세입자)
  relation?: string;
  // 매물 상태(작성중/활성)
  status: 'draft' | 'active';
  // 연락처(전화번호)
  phone: string;
  // 메모(자유 텍스트)
  memo: string;
  // 사진 URL 목록(대표사진은 photos[0])
  photos?: string[];
  // 생성 시각 // ISO 8601 UTC, 예: 2026-04-13T10:30:00.000Z
  // TODO-DB: Supabase 연동 시 created_by: string (userId) 필드 추가 필요 (RLS 권한 분리)
  createdAt: string;
};

// 고객 정보(Customer)
export type Customer = {
  // 고객 고유 아이디
  id: string;
  // 고객명
  name: string;
  // 연락처(전화번호)
  phone: string;
  // 메모(자유 텍스트)
  memo: string;
  // 생성 시각 // ISO 8601 UTC, 예: 2026-04-13T10:30:00.000Z
  // TODO-DB: Supabase 연동 시 created_by: string (userId) 필드 추가 필요 (RLS 권한 분리)
  createdAt: string;
};