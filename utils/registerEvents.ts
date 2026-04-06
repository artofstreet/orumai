/** 전역 등록 패널 이벤트 — 어느 화면에서든 패널 열기 가능 */

type OpenPanelFn = (kind: 'property' | 'customer', editId?: string) => void; // 패널 열기 함수 타입

let 전역패널열기: OpenPanelFn | null = null; // _layout에서 등록한 함수 보관
let 편집데이터: Record<string, unknown> | null = null; // 편집 시 기존 매물 데이터 보관

/** _layout.tsx 에서 패널 열기 함수 등록 */
export function registerOpenPanel(fn: OpenPanelFn): void {
  전역패널열기 = fn;
}

/** 다른 화면에서 패널 열기 요청 */
export function openRegisterPanel(
  kind: 'property' | 'customer',
  editId?: string,
  editData?: Record<string, unknown>, // 편집 시 기존 데이터 전달
): void {
  편집데이터 = editData ?? null;
  if (전역패널열기) {
    전역패널열기(kind, editId);
  }
}

/** 편집 데이터 조회 (register.tsx에서 초기값 세팅용) */
export function getEditData(): Record<string, unknown> | null {
  return 편집데이터;
}

/** 편집 데이터 초기화 (저장/취소 후 호출) */
export function clearEditData(): void {
  편집데이터 = null;
}