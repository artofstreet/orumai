import React, { useMemo } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { BADGE_COLORS, bg, border, red, text, text2 } from '@/constants/colors';
import { DUMMY_PROPERTIES } from '@/constants/dummyData';
import { getContentMaxWidth, getHorizontalPadding } from '@/constants/theme';
import PropertyCarousel from '@/components/PropertyCarousel';

// TODO-DB: supabase.from('properties').select().eq('id', id).single() 로 교체 예정

const getBadge = (key: string) =>
  key in BADGE_COLORS ? BADGE_COLORS[key as keyof typeof BADGE_COLORS] : BADGE_COLORS.기본;

const topbar = bg;

export default function PropertyDetailScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const layoutPadding = useMemo(() => getHorizontalPadding(windowWidth), [windowWidth]);
  const contentMaxWidth = useMemo(() => getContentMaxWidth(windowWidth), [windowWidth]);
  const narrow = windowWidth < 768;
  const isUltraWide = windowWidth >= 1920;
  const headerTitleSize = windowWidth < 400 ? 18 : windowWidth < 768 ? 20 : 22;

  const { id } = useLocalSearchParams<{ id: string }>();
  // TODO-DB: 매물 단건 조회 (현재는 dummyData에서 find)
  const property = useMemo(() => DUMMY_PROPERTIES.find((p) => p.id === id), [id]);

  const 준비중 = () => Alert.alert('준비 중', '곧 지원될 예정입니다.'); // 미구현 버튼 핸들러

  if (!property) {
    return (
      <View style={styles.notFound}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.notFoundBack}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.notFoundText}>매물을 찾을 수 없어요.</Text>
      </View>
    );
  }

  const title = property.buildingName ?? property.name; // 건물명 (없으면 name)
  const typeBadge = getBadge(property.type); // 매물종류 뱃지 색상
  const dealBadge = getBadge(property.deal); // 거래유형 뱃지 색상
  const photos = (property.photos ?? []).slice(0, 10); // 사진 배열 최대 10장

  /** 1280~1919px만 캐러셀 세로 200px로 제한(와이드·핸드폰 구간은 변경 없음) */
  const carouselMidDesktopClip = useMemo(() => {
    if (windowWidth >= 1280 && windowWidth < 1920) {
      return { height: 200, overflow: 'hidden' as const, width: '100%' as const };
    }
    return undefined;
  }, [windowWidth]);

  // 스펙 8개 (2열 × 4행 그리드)
  const specs = [
    { label: '면적', value: property.area },
    { label: '층수', value: property.floor },
    { label: '방향', value: property.dir ?? '—' },
    { label: '입주일', value: property.moveInDate ?? '—' },
    { label: '총층수', value: property.totalFloors ?? '—' },
    { label: '건축연도', value: property.builtYear ?? '—' },
    { label: '주차', value: property.parking ?? '—' },
    { label: '난방방식', value: property.heating ?? '—' },
  ];

  return (
    <View style={styles.page}>
      <View style={[styles.container, { paddingHorizontal: layoutPadding, maxWidth: contentMaxWidth }]}>

          <View style={[styles.header, { paddingVertical: layoutPadding }]}>
            <View style={styles.headerTopRow}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color={text} />
              </TouchableOpacity>
              <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: typeBadge.bg }]}>
                  <Text style={[styles.badgeText, { color: typeBadge.text }]}>{property.type}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: dealBadge.bg }]}>
                  <Text style={[styles.badgeText, { color: dealBadge.text }]}>{property.deal}</Text>
                </View>
              </View>
            </View>
            <Text style={[styles.headerTitle, { fontSize: headerTitleSize }]} numberOfLines={3}>
              {title}
            </Text>
            <Text style={styles.headerAddr}>📍 {property.addr}</Text>
            <View style={[styles.headerBottom, narrow && styles.headerBottomNarrow]}>
              <Text style={styles.headerPrice}>{property.price}</Text>
              <View style={[styles.headerBtnGroup, narrow && styles.headerBtnGroupNarrow]}>
                <TouchableOpacity style={styles.headerBtn} onPress={준비중}><Text style={styles.headerBtnText}>광고문구</Text></TouchableOpacity>
                <TouchableOpacity style={styles.headerBtn} onPress={준비중}><Text style={styles.headerBtnText}>A4인쇄</Text></TouchableOpacity>
                <TouchableOpacity style={styles.headerBtn} onPress={준비중}><Text style={styles.headerBtnText}>편집</Text></TouchableOpacity>
                <TouchableOpacity style={styles.headerBtn} onPress={준비중}><Text style={[styles.headerBtnText, styles.headerBtnDel]}>삭제</Text></TouchableOpacity>
              </View>
            </View>
          </View>

          {isUltraWide ? (
            <View style={styles.carouselUltraWide}>
              <PropertyCarousel photos={photos} />
            </View>
          ) : carouselMidDesktopClip ? (
            <View style={carouselMidDesktopClip}>
              <PropertyCarousel photos={photos} />
            </View>
          ) : (
            <PropertyCarousel photos={photos} />
          )}

          <View style={[styles.infoRow, narrow && styles.infoRowColumn, isUltraWide && styles.infoRowUltra]}>
            <View style={[styles.specGrid, narrow && styles.specGridFull, isUltraWide && styles.specGridUltra]}>
              {isUltraWide ? (
                <>
                  {[0, 1, 2, 3].map((row) => (
                    <View key={row} style={[styles.specRow, row < 3 && styles.specRowBottom]}>
                      {[0, 1].map((col) => {
                        const idx = row * 2 + col;
                        const { label, value } = specs[idx];
                        return (
                          <View
                            key={label}
                            style={[styles.specCellUltra2col, col === 0 && styles.specCellRight]}>
                            <Text style={styles.specLabel}>{label}</Text>
                            <Text style={styles.specValue} numberOfLines={2}>
                              {value}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  ))}
                </>
              ) : (
                <>
                  {[0, 1, 2, 3].map((row) => (
                    <View key={row} style={[styles.specRow, row < 3 && styles.specRowBottom]}>
                      {[0, 1].map((col) => {
                        const idx = row * 2 + col;
                        const { label, value } = specs[idx];
                        return (
                          <View
                            key={label}
                            style={[styles.specCell, col === 0 && styles.specCellRight]}>
                            <Text style={styles.specLabel}>{label}</Text>
                            <Text style={styles.specValue}>{value}</Text>
                          </View>
                        );
                      })}
                    </View>
                  ))}
                </>
              )}
            </View>
            <View
              style={[
                styles.memoBox,
                narrow && styles.memoBoxFull,
                isUltraWide && styles.memoBoxUltra,
                { padding: layoutPadding },
              ]}>
              <Text style={styles.memoLabel}>메모</Text>
              <ScrollView
                style={styles.memoScroll}
                contentContainerStyle={styles.memoScrollContent}
                showsVerticalScrollIndicator
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled">
                <Text style={styles.memoText}>{property.memo || '—'}</Text>
              </ScrollView>
            </View>
          </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F3F5F9' },
  container: { flex: 1, width: '100%', alignSelf: 'center' },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFoundBack: { color: '#1D4ED8', fontSize: 16, fontWeight: '600' },
  notFoundText: { color: '#334155', fontSize: 16 },
  header: { backgroundColor: topbar, gap: 8 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn: { padding: 4, marginLeft: -4 },
  badgeRow: { flexDirection: 'row', gap: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  headerTitle: { color: text, fontWeight: '800', marginTop: 4 },
  headerAddr: { color: text2, fontSize: 13 },
  headerBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2, gap: 10 },
  headerBottomNarrow: { flexDirection: 'column', alignItems: 'flex-start' },
  headerPrice: { fontSize: 20, fontWeight: '800', color: text },
  headerBtnGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  headerBtnGroupNarrow: { width: '100%', justifyContent: 'flex-start' },
  headerBtn: { borderWidth: 1, borderColor: border, borderRadius: 6, paddingHorizontal: 9, paddingVertical: 5 },
  headerBtnText: { color: text, fontSize: 12, fontWeight: '600' },
  headerBtnDel: { color: red },
  // infoRow: paddingVertical만 — paddingHorizontal은 container에서 상속
  infoRow: { flex: 1, flexDirection: 'row', alignItems: 'stretch', minHeight: 0, paddingVertical: 16, gap: 12 },
  infoRowColumn: { flexDirection: 'column' },
  infoRowUltra: { flexDirection: 'row' },
  /** 1920+ : 캐러셀과 스펙/메모 행이 같은 콘텐츠 너비(오른쪽 끝 정렬)를 쓰도록 */
  carouselUltraWide: { width: '100%', alignSelf: 'stretch' },
  specGrid: {
    flex: 1,
    minHeight: 0,
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  specGridFull: { width: '100%' },
  specGridUltra: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  specCellUltra2col: {
    width: '50%',
    minWidth: 0,
    minHeight: 0,
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'flex-start',
  },
  specRow: { flex: 1, flexDirection: 'row', minHeight: 0 },
  specRowBottom: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  specCell: {
    flex: 1,
    minHeight: 0,
    padding: 14,
    justifyContent: 'space-between',
  },
  specCellRight: { borderRightWidth: 1, borderRightColor: '#F1F5F9' },
  specLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '500', marginBottom: 4 },
  specValue: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  memoBox: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'column',
  },
  memoBoxUltra: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
  },
  memoBoxFull: { width: '100%' },
  memoScroll: { flex: 1, minHeight: 0 },
  memoScrollContent: { paddingBottom: 8 },
  memoLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '600', marginBottom: 8 },
  memoText: { fontSize: 14, color: '#334155', lineHeight: 22 },
});
