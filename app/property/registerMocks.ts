/** 매물 등록 화면용 Mock 데이터 및 유틸 (TODO-DB: API 연동 시 삭제/대체) */

// 음성 파싱 후 자동 채움용 더미 페이로드
export const VOICE_DUMMY_FILL = {
  address: '서울 송파구 올림픽로 300',
  areaSqm: '59',
  floor: '8',
  totalFloors: '25',
  deal: '월세' as const,
  propType: '아파트' as const,
  deposit: '5000',
  monthly: '80',
  direction: '남향',
  moveInDate: '2026-05-01',
  ownerName: '김오름',
  relation: '집주인' as const,
  ownerPhone: '01012345678',
  memo: '음성으로 입력한 더미 요약입니다. TODO-DB 연동 시 STT 결과로 대체.',
};

// 주소 자동완성 Mock (선택 시 면적·층수 자동 입력)
export const MOCK_ADDRESS_ROWS = [
  { id: 'a1', label: '서울 강남구 테헤란로 123', areaSqm: '84', floor: '15', totalFloors: '35' },
  { id: 'a2', label: '서울 마포구 월드컵북로 45', areaSqm: '42', floor: '3', totalFloors: '5' },
  { id: 'a3', label: '경기 성남시 분당구 판교역로 10', areaSqm: '102', floor: '22', totalFloors: '45' },
];

/** 숫자만 남기고 최대 길이 자르기 */
export const digitsOnly = (s: string, maxLen: number): string =>
  s.replace(/\D/g, '').slice(0, maxLen);

/**
 * 휴대폰 번호 하이픈 포맷 (010-xxxx-xxxx 위주)
 * @param raw 입력 문자열
 */
export const formatPhoneHyphen = (raw: string): string => {
  const d = digitsOnly(raw, 11);
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
};
