import { Platform } from 'react-native';

// ── 레이아웃 공통 상수 — 모든 페이지 컨테이너에서 공유 ──
export const LAYOUT_MAX_WIDTH = 1200; // 콘텐츠 최대 너비 (일반 데스크톱 기준)
export const LAYOUT_PADDING = 32; // 좌우 기본 여백(중간 화면 기준, 레거시)

/** 화면 폭 구간 (디자인 기준, px) — 와이드 1920+ / 일반 1280~1920 / 노트북 1024~1280 / 태블릿 768~1024 / 폰 375~768 */
export const BREAKPOINT = {
  phone: 768,
  tablet: 1024,
  laptop: 1280,
  desktop: 1920,
} as const;

/** 좌우 패딩: 좁은 폰에서 카드가 깨지지 않게 단계적으로 축소 */
export function getHorizontalPadding(windowWidth: number): number {
  if (windowWidth >= BREAKPOINT.desktop) return 40;
  if (windowWidth >= BREAKPOINT.laptop) return 32;
  if (windowWidth >= BREAKPOINT.tablet) return 24;
  if (windowWidth >= BREAKPOINT.phone) return 20;
  if (windowWidth >= 480) return 16;
  return 12;
}

/** 콘텐츠 최대 너비(중앙 정렬용). 좁은 화면에서는 화면 폭과 동일 */
export function getContentMaxWidth(windowWidth: number): number {
  const cap = windowWidth >= BREAKPOINT.desktop ? 1320 : windowWidth >= BREAKPOINT.laptop ? LAYOUT_MAX_WIDTH : windowWidth;
  return Math.min(windowWidth, cap);
}

/** 검색 결과 그리드 열 수 — 구간별로 카드 최소 너비 확보 */
export function getGridColumns(windowWidth: number): number {
  if (windowWidth >= BREAKPOINT.desktop) return 4;
  if (windowWidth >= BREAKPOINT.tablet) return 3;
  if (windowWidth >= BREAKPOINT.phone) return 2;
  return 1;
}

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
