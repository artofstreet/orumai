import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import PropertyCarousel from '@/components/PropertyCarousel';
import { BADGE_COLORS, text } from '@/constants/colors';
import { DUMMY_PROPERTIES } from '@/constants/dummyData';
import { getContentMaxWidth, getHorizontalPadding } from '@/constants/theme';
import { detailStyles as styles } from './detailStyles';

// TODO-DB: supabase.from('properties').select().eq('id', id).single() 로 교체 예정
const getBadge = (key: string) =>
  key in BADGE_COLORS ? BADGE_COLORS[key as keyof typeof BADGE_COLORS] : BADGE_COLORS.기본;

const DEAL_PRICE_COLOR: Record<string, string> = {
  매매: '#1D4ED8', // 파란색
  전세: '#16A34A', // 초록색
  월세: '#DB2777', // 분홍색
};

export default function PropertyDetailScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const layoutPadding = useMemo(() => getHorizontalPadding(windowWidth), [windowWidth]);
  const layoutWidth = useMemo(() => getContentMaxWidth(windowWidth), [windowWidth]);
  const narrow = windowWidth < 768;
  const isUltraWide = windowWidth >= 1920;
  const headerTitleSize = windowWidth < 400 ? 18 : windowWidth < 768 ? 20 : 22;

  const { id } = useLocalSearchParams<{ id: string }>();
  const property = useMemo(() => DUMMY_PROPERTIES.find((p) => p.id === id), [id]);

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

  const title = property.buildingName ?? property.name;
  const typeBadge = getBadge(property.type);
  const dealBadge = getBadge(property.deal);
  const photos = (property.photos ?? []).slice(0, 10);
  const priceColor = DEAL_PRICE_COLOR[property.deal] ?? '#0F172A';

  const specs = [
    { label: '면적', value: property.area },
    { label: '층수/총층수', value: `${property.floor}/${property.totalFloors ?? '—'}` },
    { label: '방향', value: property.dir ?? '—' },
    { label: '입주일', value: property.moveInDate ?? '—' },
  ];

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.pageScrollContent}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled={true}>
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
          <Text style={[styles.headerTitle, { fontSize: headerTitleSize }]} numberOfLines={3}>
            {title}
          </Text>
          <Text style={styles.headerAddr}>📍 {property.addr}</Text>
          <View style={[styles.headerBottom, narrow && styles.headerBottomNarrow]}>
            <Text style={[styles.headerPrice, { color: priceColor }]}>
              {property.deal} {property.price}
            </Text>
            <View style={[styles.headerBtnGroup, narrow && styles.headerBtnGroupNarrow]}>
              <TouchableOpacity style={styles.headerBtn} onPress={준비중}>
                <Text style={styles.headerBtnText}>광고문구</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerBtn} onPress={준비중}>
                <Text style={styles.headerBtnText}>A4인쇄</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerBtn} onPress={준비중}>
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
          <View
            style={[
              styles.specGrid,
              narrow && styles.specGridFull,
              isUltraWide && styles.specGridUltra,
              !narrow && styles.specGridFlex,
            ]}>
            {isUltraWide ? (
              <>
                {[0, 1].map((row) => (
                  <View key={row} style={[styles.specRow, row < 3 && styles.specRowBottom]}>
                    {[0, 1].map((col) => {
                      const idx = row * 2 + col;
                      const { label, value } = specs[idx];
                      return (
                        <View key={label} style={[styles.specCellUltra2col, col === 0 && styles.specCellRight]}>
                          <Text style={styles.specLabel}>{label}</Text>
                          <Text style={styles.specValue} numberOfLines={2}>{value}</Text>
                        </View>
                      );
                    })}
                  </View>
                ))}
              </>
            ) : (
              <>
                {[0, 1].map((row) => (
                  <View key={row} style={[styles.specRow, row < 3 && styles.specRowBottom]}>
                    {[0, 1].map((col) => {
                      const idx = row * 2 + col;
                      const { label, value } = specs[idx];
                      return (
                        <View key={label} style={[styles.specCell, col === 0 && styles.specCellRight]}>
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
              !narrow && styles.memoBoxFlex,
              { padding: layoutPadding },
            ]}>
            <Text style={styles.memoLabel}>메모</Text>
            <View style={styles.memoBody}>
              <Text style={styles.memoText}>{property.memo || '—'}</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}