// 오름AI 부동산 CRM 앱에서 공통으로 쓰는 타입을 모아둔 파일입니다.

// 매물 종류(PropertyType)
export type PropertyType =
  | '아파트'
  | '빌라'
  | '원룸'
  | '투룸'
  | '오피스텔'
  | '상가'
  | '사무실';

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
  deal: string;
  // 가격(표시용 문자열)
  price: string;
  // 면적(예: 84㎡)
  area: string;
  // 층수(예: 25층)
  floor: string;
  // 방향(선택)
  dir?: string;
  // 입주일(선택, 예: 즉시입주 / 2026-05-01)
  moveInDate?: string;
  // 총층수(선택, 예: 35층)
  totalFloors?: string;
  // 건축연도(선택, 예: 2015년)
  builtYear?: string;
  // 주차(선택, 예: 1대)
  parking?: string;
  // 난방방식(선택, 예: 지역난방)
  heating?: string;
  // 매물 상태(예: 완료/작성중)
  status: 'done' | 'draft';
  // 연락처(전화번호)
  phone: string;
  // 메모(자유 텍스트)
  memo: string;
  // 사진 URL 목록(대표사진은 photos[0])
  // NOTE: 기존 Photo[] 구조 대신 URL 배열로 단순화(테스트/웹 호환)
  photos?: string[];
  // 생성 시각(문자열, ISO 권장)
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
  // 생성 시각(문자열, ISO 권장)
  createdAt: string;
};

