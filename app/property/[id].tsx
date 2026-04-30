import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import AdCopyModal from '@/components/AdCopyModal';
import { detailStyles, specFontStyles, specLayoutStyles, specMobileStyles, addrBtnStyles } from '@/components/property/detailStyles';
import PropertySpecGrid from '@/components/property/PropertySpecGrid';
import PropertyCarousel from '@/components/PropertyCarousel';
import { BADGE_COLORS, text } from '@/constants/colors';
import { getContentMaxWidth, getHorizontalPadding } from '@/constants/theme';
import { usePropertiesContext } from '@/contexts/PropertiesContext';
import { printPropertyPost, printPropertyConsult } from '@/utils/printProperty';
import { openRegisterPanel } from '@/utils/registerEvents';
// TODO-DB: supabase.from('properties').select().eq('id', id).single() 로 교체 예정
// TODO-AUTH: 매물 상세·시세조회 접근 권한은 로그인·역할 연동 후 제한
// TODO-STORAGE: 최근 시세조회 매물 id 로컬 캐시 등 확장 가능

const getBadge = (key: string) =>
  key in BADGE_COLORS ? BADGE_COLORS[key as keyof typeof BADGE_COLORS] : BADGE_COLORS.기본;

const DEAL_PRICE_COLOR: Record<string, string> = { 매매: '#1D4ED8', 전세: '#16A34A', 월세: '#DB2777' };
const isWeb = Platform.OS === 'web';
export default function PropertyDetailScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const layoutPadding = useMemo(() => getHorizontalPadding(windowWidth), [windowWidth]);
  const layoutWidth   = useMemo(() => getContentMaxWidth(windowWidth), [windowWidth]);
  const narrow        = windowWidth < 768;
  const isUltraWide   = windowWidth >= 1920;
  const headerTitleSize = windowWidth < 400 ? 20 : windowWidth < 768 ? 22 : 22;

  const { getPropertyById, deleteProperty, properties } = usePropertiesContext();

  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id; // 배열 방어 — expo-router 쿼리 중복 시 string[]
  const property = useMemo(() => (id ? getPropertyById(id) : undefined), [getPropertyById, id, properties]);

  const [adCopyVisible, setAdCopyVisible] = useState<boolean>(false);
  const 준비중 = () => Alert.alert('준비 중', '곧 지원될 예정입니다.');
  // 웹 전용: 캐러셀 높이 제한 (앱은 PropertyCarousel의 aspectRatio 3/4로 충분)
  const carouselMidDesktopClip = useMemo(() => {
    if (Platform.OS === 'web' && !narrow) {
      return { height: 280, overflow: 'hidden' as const, width: '100%' as const };
    }
    return undefined;
  }, [narrow]);

  if (!property) {
    return (
      <View style={detailStyles.notFound}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={detailStyles.notFoundBack}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={detailStyles.notFoundText}>매물을 찾을 수 없어요.</Text>
      </View>
    );
  }
  const title      = property.buildingName ?? property.name ?? '매물 상세';
  const typeBadge  = getBadge(property.type);
  const dealBadge  = getBadge(property.deal);
  const photos     = (property.photos ?? []).slice(0, 10);
  const priceColor = DEAL_PRICE_COLOR[property.deal] ?? '#0F172A';

  const specs = [
    { label: '면적', value: (() => {
      const num = parseFloat((property.area ?? '').replace(/[^0-9.]/g, ''));
      if (!num || isNaN(num)) return property.area ?? '—';
      const pyeong = Math.round(num * 0.3025 * 10) / 10;
      return `${num}㎡/${pyeong}평`;
    })() },
    { label: '층/총층', value: `${property.floor.replace(/[^0-9]/g, '') || '—'}/${property.totalFloors ?? '—'}` },
    { label: '방향', value: property.dir ?? '—' },
    { label: '입주일', value: property.moveInDate ?? '—' },
  ];

  // 스펙 2번째 줄: 공급면적, 주차, 난방, 준공일
  const specs2 = [
    { label: '공급면적', value: (() => {
      const num = parseFloat((property.supplyArea ?? '').replace(/[^0-9.]/g, ''));
      if (!num || isNaN(num)) return property.supplyArea ?? '-';
      const pyeong = Math.round(num * 0.3025 * 10) / 10;
      return `${num}㎡/${pyeong}평`;
    })() },
    { label: '주차', value: property.parking ?? '-' },
    { label: '난방', value: property.heating ?? '-' },
    { label: '준공일', value: property.builtYear ? `${property.builtYear}년` : '-' },
  ];

  // 스펙 3번째 줄: 세대수, 용적률, 연면적, 총주차수 (총괄표제부)
  const specs3 = [
    { label: '세대수', value: property.hhldCnt ? `${property.hhldCnt}세대` : '-' },
    { label: '용적률', value: property.vlRat ? `${property.vlRat}%` : '-' },
    { label: '연면적', value: property.totArea ? `${property.totArea}㎡` : '-' },
    { label: '총주차', value: property.totPkngCnt ? `${property.totPkngCnt}대` : '-' },
  ];

  // 국토부 실거래가(rt.molit.go.kr) — 주소를 쿼리로 전달(사이트가 무시하면 메인으로 열림)
  const openMolitRealTrade = useCallback(async () => {
    const base = 'https://rt.molit.go.kr';
    const addr = property.addr.trim();
    const url = `${base}/?${new URLSearchParams({ addr }).toString()}`;
    try {
      if (await Linking.canOpenURL(url)) await Linking.openURL(url);
      else if (await Linking.canOpenURL(base)) await Linking.openURL(base);
    } catch {
      Alert.alert('오류', '링크를 열 수 없습니다.');
    }
  }, [property.addr]);

  // 주소 복사
  const copyAddress = useCallback(async (): Promise<void> => {
    await Clipboard.setStringAsync(property.addr);
    Alert.alert('복사 완료', '주소가 복사되었습니다.');
  }, [property.addr]);

  return (
    <ScrollView style={detailStyles.page} contentContainerStyle={detailStyles.pageScrollContent} keyboardShouldPersistTaps="handled" nestedScrollEnabled={true}>
      <View style={[detailStyles.container, { paddingHorizontal: layoutPadding, maxWidth: layoutWidth }]}>
        <View style={[detailStyles.header, { paddingVertical: layoutPadding }]}>
          <View style={detailStyles.headerTopRow}>
            <TouchableOpacity onPress={() => router.back()} style={detailStyles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={text} />
            </TouchableOpacity>
            <View style={detailStyles.badgeRow}>
              <View style={[detailStyles.badge, { backgroundColor: typeBadge.bg }]}>
                <Text style={[detailStyles.badgeText, { color: typeBadge.text }]}>{property.type}</Text>
              </View>
              <View style={[detailStyles.badge, { backgroundColor: dealBadge.bg }]}>
                <Text style={[detailStyles.badgeText, { color: dealBadge.text }]}>{property.deal}</Text>
              </View>
            </View>
          </View>

          <Text style={[detailStyles.headerTitle, { fontSize: isWeb ? headerTitleSize + 3 : headerTitleSize }]} numberOfLines={3}>{title}</Text>
          <Text style={[detailStyles.headerAddr, { color: '#374151', fontSize: 16, fontWeight: '500', marginTop: 2 }]}>{property.addr}</Text>
          {/* 지도/주소 복사 버튼 */}
          <View style={[addrBtnStyles.addrBtnRow, { marginTop: 2 }]}>
            <TouchableOpacity style={addrBtnStyles.addrBtnCopy} onPress={copyAddress}>
              <Ionicons name="copy-outline" size={13} color="#64748B" />
              <Text style={addrBtnStyles.addrBtnCopyText}>주소 복사</Text>
            </TouchableOpacity>
          </View>

          <View style={[detailStyles.headerBottom, narrow && detailStyles.headerBottomNarrow]}>
            <Text style={[detailStyles.headerPrice, { color: priceColor }]}>{property.deal} {property.price}</Text>
            <View style={[detailStyles.headerBtnGroup, narrow && detailStyles.headerBtnGroupNarrow]}>
              <TouchableOpacity style={detailStyles.headerBtn} onPress={openMolitRealTrade}>
                <Text style={detailStyles.headerBtnText}>시세조회</Text>
              </TouchableOpacity>
              <TouchableOpacity style={detailStyles.headerBtn} onPress={() => setAdCopyVisible(true)}>
                <Text style={detailStyles.headerBtnText}>광고문구</Text>
              </TouchableOpacity>
              {Platform.OS === 'web' && (
                <>
                  {/* 웹: 게시용인쇄 / 상담용인쇄 A4 템플릿 */}
                  <TouchableOpacity style={detailStyles.headerBtn} onPress={() => printPropertyPost(property)}>
                    <Text style={detailStyles.headerBtnText}>게시용인쇄</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={detailStyles.headerBtn} onPress={() => printPropertyConsult(property)}>
                    <Text style={detailStyles.headerBtnText}>상담용인쇄</Text>
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity style={detailStyles.headerBtn} onPress={() => openRegisterPanel('property', property.id, property as Record<string, unknown>)}>
                <Text style={detailStyles.headerBtnText}>편집</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={detailStyles.headerBtn}
                onPress={() => {
                  if (Platform.OS === 'web') {
                    if (window.confirm('정말로 삭제하시겠습니까?')) {
                      deleteProperty(property.id).then(() => router.back());
                    }
                  } else {
                    Alert.alert('매물 삭제', '정말로 삭제하시겠습니까?', [
                      { text: '취소', style: 'cancel' },
                      { text: '삭제', style: 'destructive', onPress: () => { deleteProperty(property.id).then(() => router.back()); } },
                    ]);
                  }
                }}>
                <Text style={[detailStyles.headerBtnText, detailStyles.headerBtnDel]}>삭제</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View onStartShouldSetResponder={() => true}>
          {isUltraWide ? (
            <View style={detailStyles.carouselUltraWide}>
              <PropertyCarousel photos={photos} />
            </View>
          ) : carouselMidDesktopClip ? (
            <View style={carouselMidDesktopClip}>
              <PropertyCarousel photos={photos} />
            </View>
          ) : (
            <PropertyCarousel photos={photos} />
          )}
        </View>

        <View style={[detailStyles.infoRow]}>
          <PropertySpecGrid specs={specs} specs2={specs2} specs3={specs3} narrow={narrow} isUltraWide={isUltraWide} />

          <View style={[detailStyles.memoBox, narrow && detailStyles.memoBoxFull, isUltraWide && detailStyles.memoBoxUltra, !narrow && detailStyles.memoBoxFlex, { padding: layoutPadding }]}>
            <Text style={detailStyles.memoLabel}>메모</Text>
            <View style={detailStyles.memoBody}>
              {property.ownerName && (
                <Text style={detailStyles.memoText}>집주인: {property.ownerName}</Text>
              )}
              {property.phone && (
                <Text style={detailStyles.memoText}>연락처: {property.phone}</Text>
              )}
              {/* 집주인메모 제거: 일반 메모란에 통합 */}
              <Text style={detailStyles.memoText}>{property.memo || '—'}</Text>
            </View>
          </View>
        </View>
      </View>

      <AdCopyModal visible={adCopyVisible} property={property} onClose={() => setAdCopyVisible(false)} />
    </ScrollView>
  );
}
