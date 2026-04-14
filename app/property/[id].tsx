import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActionSheetIOS,
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
import { detailStyles } from '@/components/property/detailStyles';
import PropertyCarousel from '@/components/PropertyCarousel';
import { BADGE_COLORS, text } from '@/constants/colors';
import { DUMMY_PROPERTIES } from '@/constants/dummyData';
import { getContentMaxWidth, getHorizontalPadding } from '@/constants/theme';
import { printPropertyPost, printPropertyConsult } from '@/utils/printProperty';
import { openRegisterPanel } from '@/utils/registerEvents';
// TODO-DB: supabase.from('properties').select().eq('id', id).single() 로 교체 예정
// TODO-AUTH: 매물 상세·시세조회 접근 권한은 로그인·역할 연동 후 제한
// TODO-STORAGE: 최근 시세조회 매물 id 로컬 캐시 등 확장 가능

const getBadge = (key: string) =>
  key in BADGE_COLORS ? BADGE_COLORS[key as keyof typeof BADGE_COLORS] : BADGE_COLORS.기본;

const DEAL_PRICE_COLOR: Record<string, string> = { 매매: '#1D4ED8', 전세: '#16A34A', 월세: '#DB2777' };
/** 매물 스펙 라벨·값 — detailStyles 위에 절대 크기·굵기 덮어씀 */
const specFontStyles = StyleSheet.create({
  specLabel: { fontSize: 14, lineHeight: 16 }, // 면적·층수 등 라벨
  specValue: { fontSize: 15, fontWeight: '600' }, // 49㎡ 등 값만 굵기 600
});
/** 스펙 행·칸 정렬 (detailStyles.specRow/specCell 위에만 적용) */
const specLayoutStyles = StyleSheet.create({
  specRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  specItem: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  specTextVertical: { textAlignVertical: 'top' },
});

// 지도/주소 복사 버튼 스타일 (detailStyles.ts가 아닌 이 파일 내부에서만 추가)
const localStyles = StyleSheet.create({
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

const styles = { ...detailStyles, ...localStyles };
export default function PropertyDetailScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const layoutPadding = useMemo(() => getHorizontalPadding(windowWidth), [windowWidth]);
  const layoutWidth   = useMemo(() => getContentMaxWidth(windowWidth), [windowWidth]);
  const narrow        = windowWidth < 768;
  const isUltraWide   = windowWidth >= 1920;
  const headerTitleSize = windowWidth < 400 ? 18 : windowWidth < 768 ? 20 : 22;

  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id; // 배열 방어 — expo-router 쿼리 중복 시 string[]
  const property = useMemo(() => DUMMY_PROPERTIES.find((p) => p.id === id), [id]);

  const [adCopyVisible, setAdCopyVisible] = useState<boolean>(false);
  const 준비중 = () => Alert.alert('준비 중', '곧 지원될 예정입니다.');
  const carouselMidDesktopClip = useMemo(() => {
    if (windowWidth >= 1280 && windowWidth < 1920) {
      return { height: 380, overflow: 'hidden' as const, width: '100%' as const };
    }
    return undefined;
  }, [windowWidth]);

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
  const title      = property.buildingName ?? property.name;
  const typeBadge  = getBadge(property.type);
  const dealBadge  = getBadge(property.deal);
  const photos     = (property.photos ?? []).slice(0, 10);
  const priceColor = DEAL_PRICE_COLOR[property.deal] ?? '#0F172A';

  const specs = [
    { label: '면적', value: property.area },
    { label: '층/총층', value: `${property.floor}/${property.totalFloors ?? '—'}` },
    { label: '방향', value: property.dir ?? '—' },
    { label: '입주일', value: property.moveInDate ?? '—' },
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

  // 지도 앱/웹 선택 후 길찾기 열기
  const openMapOptions = useCallback(async (): Promise<void> => {
    const addr = property.addr.trim();
    const encodedAddr = encodeURIComponent(addr);
    if (!addr) {
      Alert.alert('오류', '주소가 없습니다.');
      return;
    }

    // 웹: 네이버 지도 검색 탭 열기
    if (Platform.OS === 'web') {
      window.open(`https://map.naver.com/v5/search/${encodedAddr}`, '_blank');
      return;
    }

    const openKakao = async (): Promise<void> => {
      const canKakao = await Linking.canOpenURL('kakaomap://');
      const url = canKakao ? `kakaomap://search?q=${addr}` : `https://map.kakao.com/?q=${encodedAddr}`;
      await Linking.openURL(url);
    };

    const openNaver = async (): Promise<void> => {
      const canNaver = await Linking.canOpenURL('nmap://');
      const url = canNaver
        ? `nmap://search?query=${encodedAddr}&appname=com.orumai`
        : `https://map.naver.com/v5/search/${encodedAddr}`;
      await Linking.openURL(url);
    };

    const openGoogle = async (): Promise<void> => {
      await Linking.openURL(`https://www.google.com/maps/search/${encodedAddr}`);
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['취소', '카카오맵', '네이버지도', '구글맵'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          void (async () => {
            try {
              if (buttonIndex === 1) await openKakao();
              if (buttonIndex === 2) await openNaver();
              if (buttonIndex === 3) await openGoogle();
            } catch {
              Alert.alert('오류', '링크를 열 수 없습니다.');
            }
          })();
        }
      );
      return;
    }

    // Android: Alert로 선택지 노출
    Alert.alert('지도/길찾기', '어떤 지도로 여시겠어요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '카카오맵',
        onPress: () => {
          void (async () => {
            try { await openKakao(); } catch { Alert.alert('오류', '링크를 열 수 없습니다.'); }
          })();
        },
      },
      {
        text: '네이버지도',
        onPress: () => {
          void (async () => {
            try { await openNaver(); } catch { Alert.alert('오류', '링크를 열 수 없습니다.'); }
          })();
        },
      },
      {
        text: '구글맵',
        onPress: () => {
          void (async () => {
            try { await openGoogle(); } catch { Alert.alert('오류', '링크를 열 수 없습니다.'); }
          })();
        },
      },
    ]);
  }, [property.addr]);

  // 주소 복사
  const copyAddress = useCallback(async (): Promise<void> => {
    await Clipboard.setStringAsync(property.addr);
    Alert.alert('복사 완료', '주소가 복사되었습니다.');
  }, [property.addr]);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageScrollContent} keyboardShouldPersistTaps="handled" nestedScrollEnabled={true}>
      <View style={[styles.container, { paddingHorizontal: layoutPadding, maxWidth: layoutWidth }]}>
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

          <Text style={[styles.headerTitle, { fontSize: headerTitleSize }]} numberOfLines={3}>{title}</Text>
          <Text style={[styles.headerAddr, { color: '#374151', fontSize: 16, fontWeight: '500', marginTop: 2 }]}>{property.addr}</Text>
          {/* 지도/주소 복사 버튼 */}
          <View style={[styles.addrBtnRow, { marginTop: 2 }]}>
            <TouchableOpacity style={styles.addrBtnMap} onPress={openMapOptions}>
              <Ionicons name="navigate-outline" size={13} color="#C2410C" />
              <Text style={styles.addrBtnMapText}>지도/길찾기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addrBtnCopy} onPress={copyAddress}>
              <Ionicons name="copy-outline" size={13} color="#64748B" />
              <Text style={styles.addrBtnCopyText}>주소 복사</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.headerBottom, narrow && styles.headerBottomNarrow]}>
            <Text style={[styles.headerPrice, { color: priceColor }]}>{property.deal} {property.price}</Text>
            <View style={[styles.headerBtnGroup, narrow && styles.headerBtnGroupNarrow]}>
              <TouchableOpacity style={styles.headerBtn} onPress={openMolitRealTrade}>
                <Text style={styles.headerBtnText}>시세조회</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerBtn} onPress={() => setAdCopyVisible(true)}>
                <Text style={styles.headerBtnText}>광고문구</Text>
              </TouchableOpacity>
              {Platform.OS === 'web' && (
                <>
                  {/* 웹: 게시용인쇄 / 상담용인쇄 A4 템플릿 */}
                  <TouchableOpacity style={styles.headerBtn} onPress={() => printPropertyPost(property)}>
                    <Text style={styles.headerBtnText}>게시용인쇄</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.headerBtn} onPress={() => printPropertyConsult(property)}>
                    <Text style={styles.headerBtnText}>상담용인쇄</Text>
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity style={styles.headerBtn} onPress={() => openRegisterPanel('property', property.id, property as Record<string, unknown>)}>
                <Text style={styles.headerBtnText}>편집</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerBtn} onPress={준비중}>
                <Text style={[styles.headerBtnText, styles.headerBtnDel]}>삭제</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View onStartShouldSetResponder={() => true}>
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
        </View>

        <View style={[styles.infoRow]}>
          <View style={[styles.specGrid, narrow && styles.specGridFull, isUltraWide && styles.specGridUltra, !narrow && styles.specGridFlex]}>
            {isUltraWide ? (
              <>
                {[0, 1].map((row) => (
                  <View key={row} style={[styles.specRow, row < 3 && styles.specRowBottom, specLayoutStyles.specRow]}>
                    {[0, 1].map((col) => {
                      const idx = row * 2 + col;
                      const { label, value } = specs[idx];
                      return (
                        <View key={label} style={[styles.specCellUltra2col, specLayoutStyles.specItem, col === 0 && styles.specCellRight]}>
                          <Text style={[styles.specLabel, specFontStyles.specLabel, specLayoutStyles.specTextVertical]}>{label}</Text>
                          <Text style={[styles.specValue, specFontStyles.specValue, specLayoutStyles.specTextVertical]} numberOfLines={2}>{value}</Text>
                        </View>
                      );
                    })}
                  </View>
                ))}
              </>
            ) : (
              <View style={[styles.specRow, specLayoutStyles.specRow]}>
                {specs.map((spec, idx) => (
                  <View key={spec.label} style={[styles.specCell, specLayoutStyles.specItem, idx < specs.length - 1 && styles.specCellRight]}>
                    <Text style={[styles.specLabel, specFontStyles.specLabel]}>{spec.label}</Text>
                    <Text style={[styles.specValue, specFontStyles.specValue]}>{spec.value}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={[styles.memoBox, narrow && styles.memoBoxFull, isUltraWide && styles.memoBoxUltra, !narrow && styles.memoBoxFlex, { padding: layoutPadding }]}>
            <Text style={styles.memoLabel}>메모</Text>
            <View style={styles.memoBody}>
              <Text style={styles.memoText}>{property.memo || '—'}</Text>
            </View>
          </View>
        </View>
      </View>

      <AdCopyModal visible={adCopyVisible} property={property} onClose={() => setAdCopyVisible(false)} />
    </ScrollView>
  );
}
