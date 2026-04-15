/** 매물 등록 화면 공통 타입·옵션 배열 */

export type DealKind = '매매' | '전세' | '월세';
// TODO-DB: types/index.ts 의 PropertyType과 통일 필요 (연립/사무실 불일치 확인 후 병합)
// 매물 종류 칩 — PROP_OPTIONS 순서·항목과 동일해야 함
export type PropKind =
  | '아파트'
  | '빌라'
  | '다세대'
  | '연립'
  | '오피스텔'
  | '상가'
  | '사무실'
  | '단독주택'
  | '원룸'
  | '투룸';
export type RelationKind = '집주인' | '대리인';
export type VoicePhase = 'idle' | 'recording' | 'parsing';

export const DEAL_OPTIONS: DealKind[] = ['매매', '전세', '월세'];
// 칩 표시 순서 (UI는 registerChipBlocks 그대로)
export const PROP_OPTIONS: PropKind[] = [
  '아파트',
  '빌라',
  '다세대',
  '연립',
  '오피스텔',
  '상가',
  '사무실',
  '단독주택',
  '원룸',
  '투룸',
];
export const REL_OPTIONS: RelationKind[] = ['집주인', '대리인'];
