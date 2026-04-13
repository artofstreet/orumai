/** 매물 등록 화면 공통 타입·옵션 배열 */

export type DealKind = '매매' | '전세' | '월세';
// TODO-DB: types/index.ts 의 PropertyType과 통일 필요 (연립/사무실 불일치 확인 후 병합)
export type PropKind =
  | '아파트'
  | '빌라'
  | '상가'
  | '오피스텔'
  | '단독주택'
  | '원룸'
  | '투룸'
  | '연립';
export type RelationKind = '집주인' | '대리인';
export type VoicePhase = 'idle' | 'recording' | 'parsing';

export const DEAL_OPTIONS: DealKind[] = ['매매', '전세', '월세'];
export const PROP_OPTIONS: PropKind[] = [
  '아파트',
  '빌라',
  '상가',
  '오피스텔',
  '단독주택',
  '원룸',
  '투룸',
  '연립',
];
export const REL_OPTIONS: RelationKind[] = ['집주인', '대리인'];
