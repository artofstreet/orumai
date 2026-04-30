import { Platform, StyleSheet } from 'react-native';

import { bg, border, red, text } from '@/constants/colors';

// 플랫폼별 그림자 유틸
const makeShadow = (h: number, r: number, o: number, elev: number) =>
  Platform.OS === 'web'
    ? ({ boxShadow: `0 ${h}px ${r * 2}px rgba(0,0,0,${o})` } as object)
    : { shadowColor: '#000' as const, shadowOffset: { width: 0, height: h }, shadowOpacity: o, shadowRadius: r, elevation: elev };

const isWeb = Platform.OS === 'web';

/** 매물 상세 화면 StyleSheet — [id].tsx 전용 */
export const detailStyles = StyleSheet.create({
  page:                  { flex: 1, backgroundColor: bg },
  pageScrollContent:     { flexGrow: 1 },
  container:             { width: '100%', alignSelf: 'center' },
  notFound:              { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFoundBack:          { color: '#1D4ED8', fontSize: 16, fontWeight: '600' },
  notFoundText:          { color: '#334155', fontSize: 16 },
  header:                { backgroundColor: bg, gap: 8 },
  headerTopRow:          { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn:               { padding: 4, marginLeft: -4 },
  badgeRow:              { flexDirection: 'row', gap: 8 },
  badge:                 { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText:             { fontSize: isWeb ? 17 : 15, fontWeight: '700' },
  headerTitle:           { color: text, fontWeight: '800', marginTop: 4 },
  headerAddr:            { color: '#374151', fontSize: isWeb ? 17 : 15, fontWeight: '500' },
  headerBottom:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2, gap: 10 },
  headerBottomNarrow:    { flexDirection: 'column', alignItems: 'flex-start' },
  headerPrice:           { fontSize: isWeb ? 23 : 22, fontWeight: '800', color: text },
  headerBtnGroup:        { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  headerBtnGroupNarrow:  { width: '100%', justifyContent: 'flex-start' },
  headerBtn:             { borderWidth: 1, borderColor: border, borderRadius: 6, paddingHorizontal: 9, paddingVertical: 5 },
  headerBtnText:         { color: text, fontSize: isWeb ? 14 : 12, fontWeight: '600' },
  headerBtnDel:          { color: red },
  infoRow:               { flexDirection: 'column', alignItems: 'stretch', paddingVertical: 16, gap: 12 },
  infoRowWide:           { width: '100%' },
  infoRowColumn:         { flexDirection: 'column' },
  carouselUltraWide:     { width: '100%', alignSelf: 'stretch' },
  specGrid: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    ...makeShadow(2, 8, 0.06, 2),
  },
  specGridFull:          { width: '100%' },
  specGridFlex:          { minWidth: 0, flex: 1 },
  specGridUltra:         { minWidth: 0 },
  specCellUltra2col:     { width: '50%', minWidth: 0, paddingVertical: 12, paddingHorizontal: 8, justifyContent: 'flex-start' },
  specRow:               { flexDirection: 'row', flex: 1 },
  specRowBottom:         { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  specCell:              { flex: 1, paddingTop: 12, paddingBottom: 12, paddingHorizontal: 6, justifyContent: 'flex-start', gap: 2, minWidth: 0 },
  specCellRight:         { borderRightWidth: 1, borderRightColor: '#F1F5F9' },
  specLabel:             { fontSize: isWeb ? 13 : 11, color: '#94A3B8', fontWeight: '500', marginBottom: 8 },
  specValue:             { fontSize: isWeb ? 14 : 12, fontWeight: '700', color: '#1E293B', flexWrap: 'wrap' },
  memoBox: {
    minHeight: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    ...makeShadow(2, 8, 0.06, 2),
    flexDirection: 'column',
  },
  memoBoxUltra:          { minWidth: 0 },
  memoBoxFlex:           { minWidth: 0 },
  memoBoxFull:           { width: '100%' },
  memoBody:              { paddingBottom: 8 },
  memoLabel:             { fontSize: isWeb ? 13 : 11, color: '#94A3B8', fontWeight: '600', marginBottom: 8 },
  memoText:              { fontSize: isWeb ? 16 : 14, color: '#334155', lineHeight: 22 },
});

export const specFontStyles = StyleSheet.create({
  specLabel: {
    fontSize: isWeb ? 15 : 13,
    lineHeight: 18,
    fontWeight: '500',
    color: '#64748B',
    marginRight: 6,
    flexShrink: 0,
    includeFontPadding: false,
  },
  specValue: {
    fontSize: isWeb ? 17 : 15,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
    flex: 1,
    flexShrink: 1,
    includeFontPadding: false,
  },
});

export const specLayoutStyles = StyleSheet.create({
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  specItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-start',
    gap: 6,
    overflow: 'hidden',
  },
  specTextVertical: { textAlignVertical: 'center' },
});

export const specMobileStyles = StyleSheet.create({
  specRowMobile: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
  },
  specCellMobile: {
    width: '50%',
    minWidth: 0,
    paddingVertical: 12,
    paddingHorizontal: 6,
    flexDirection: 'column',
    gap: 8,
    justifyContent: 'flex-start',
  },
  specCellMobileRight: {
    borderRightWidth: 1,
    borderRightColor: '#F1F5F9',
  },
  specLabelMobile: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  specValueMobile: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    alignSelf: 'stretch',
  },
});

export const addrBtnStyles = StyleSheet.create({
  addrBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 0,
  },
  addrBtnMap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDBA74',
    backgroundColor: '#FFF7ED',
  },
  addrBtnMapText: {
    fontSize: 12,
    color: '#C2410C',
    fontWeight: '600',
  },
  addrBtnCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: 'transparent',
  },
  addrBtnCopyText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
});