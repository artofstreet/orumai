// 앱 전역에서 재사용할 색상 팔레트입니다.

export const primary = '#1A56DB'; // 주요 버튼, 링크
export const primaryLight = '#EEF3FD'; // 선택 배경
export const primaryDark = '#1446C4'; // 버튼 hover
export const green = '#0E7A4F'; // 완료, 성공
export const greenLight = '#E8F5EF'; // 성공 배경
export const red = '#EF4444'; // 삭제, 오류
export const text = '#18202E'; // 본문
export const text2 = '#6B7585'; // 보조 텍스트
export const text3 = '#9AA5B4'; // 힌트, 플레이스홀더
export const border = '#D8DCE6'; // 구분선, 테두리
export const bg = '#FFFFFF'; // 화면 배경
export const card = '#FFFFFF'; // 카드 배경
export const topbar = '#111827'; // 상단 바

// 뱃지 색상 - 네이비 단일 계열로 통일
export const BADGE_COLORS = {
  // 매물 종류
  아파트: { bg: '#EEF2FF', text: '#3B4FC8' },
  빌라: { bg: '#EEF2FF', text: '#3B4FC8' },
  원룸: { bg: '#EEF2FF', text: '#3B4FC8' },
  투룸: { bg: '#EEF2FF', text: '#3B4FC8' },
  오피스텔: { bg: '#EEF2FF', text: '#3B4FC8' },
  상가: { bg: '#EEF2FF', text: '#3B4FC8' },
  사무실: { bg: '#EEF2FF', text: '#3B4FC8' },
  단독주택: { bg: '#EEF2FF', text: '#3B4FC8' },
  // 거래 유형
  매매: { bg: '#E8F4FD', text: '#1A6FA8' },
  전세: { bg: '#E8F4FD', text: '#1A6FA8' },
  월세: { bg: '#E8F4FD', text: '#1A6FA8' },
  기본: { bg: '#F1F5F9', text: '#475569' },
} as const;

// 가격 색상 - 단일 네이비 계열
export const PRICE_COLOR = '#1D4ED8'; // 모든 거래유형 동일 색상

