/** 전역 등록 패널 이벤트 — 어느 화면에서든 패널 열기 가능 */

type OpenPanelFn = (kind: 'property' | 'customer', editId?: string, editData?: Record<string, unknown>) => void; // 패널 열기 함수 타입

let 전역패널열기: OpenPanelFn | null = null; // _layout에서 등록한 함수 보관

let 전역패널닫기: (() => void) | null = null;

/** _layout.tsx 에서 패널 열기 함수 등록 */
export function registerOpenPanel(fn: OpenPanelFn): void {
  전역패널열기 = fn;
}

/** 다른 화면에서 패널 열기 요청 */
export function openRegisterPanel(
  kind: 'property' | 'customer',
  editId?: string,
  editData?: Record<string, unknown>,
): void {
  if (전역패널열기) {
    전역패널열기(kind, editId, editData); // editData를 직접 인자로 전달
  }
}

export function registerClosePanel(fn: () => void): void {
  전역패널닫기 = fn;
}

export function closeRegisterPanel(): void {
  if (전역패널닫기) {
    전역패널닫기();
  }
}

/** 더미 — 하위 호환용 */
export function getEditData(): null { return null; }
export function clearEditData(): void {}