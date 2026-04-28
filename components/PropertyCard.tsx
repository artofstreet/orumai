import React, { useMemo, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { PRICE_COLOR } from '@/constants/colors';
import type { Property } from '@/types';

// TODO-STYLE: 여러 파일 중복 — 나중에 constants/theme.ts로 통합 예정
// 플랫폼별 그림자 유틸
const makeShadow = (h: number, r: number, o: number, elev: number) =>
  Platform.OS === 'web'
    ? ({ boxShadow: `0 ${h}px ${r * 2}px rgba(0,0,0,${o})` } as object)
    : { shadowColor: '#000' as const, shadowOffset: { width: 0, height: h }, shadowOpacity: o, shadowRadius: r, elevation: elev };

// 거래유형별 가격 색상
const DEAL_PRICE_COLOR: Record<string, string> = {
  매매: '#1D4ED8',
  전세: '#16A34A',
  월세: '#DB2777',
};

// 매물종류 칩 색상
const TYPE_CHIP: Record<string, { bg: string; text: string }> = {
  아파트:   { bg: '#EEF2FF', text: '#4338CA' },
  빌라:    { bg: '#F5F3FF', text: '#6D28D9' },
  원룸:    { bg: '#FFF7ED', text: '#C2410C' },
  투룸:    { bg: '#ECFDF5', text: '#065F46' },
  오피스텔: { bg: '#F0F9FF', text: '#0369A1' },
  상가:    { bg: '#F0FDF4', text: '#15803D' },
  사무실:   { bg: '#F8FAFC', text: '#334155' },
  단독주택:  { bg: '#FEFCE8', text: '#854D0E' },
};

const getTypeChip = (type: string) => TYPE_CHIP[type] ?? { bg: '#F1F5F9', text: '#475569' }; // 매물종류 칩 색상 조회(없으면 기본값)

const formatDate = (iso: string): string => (iso ? iso.slice(0, 10) : ''); // ISO 날짜 → YYYY-MM-DD

export interface PropertyCardProps {
  property: Property;   // 매물 데이터
  width: number;        // 카드 너비
  onPress?: () => void; // 카드 클릭 동작(선택)
}

export default function PropertyCard({ property, width, onPress }: PropertyCardProps) {
  const priceColor  = useMemo(() => DEAL_PRICE_COLOR[property.deal] ?? PRICE_COLOR, [property.deal]); // 거래유형별 가격 색상
  const typeChip    = useMemo(() => getTypeChip(property.type), [property.type]);
  const title       = property.buildingName ?? property.name ?? '이름 없음'; // 건물명 우선
  const createdDate = useMemo(() => formatDate(property.createdAt), [property.createdAt]);
  const photoCount  = property.photos?.length ?? 0; // 사진 장수

  const [isHovered, setIsHovered] = useState<boolean>(false);
  const hoverStyle = useMemo(() => {
    if (Platform.OS !== 'web') return null;
    return isHovered
      ? ({ boxShadow: '0 4px 12px rgba(0,0,0,0.14)', transform: [{ translateY: -2 }], transition: 'all 0.2s ease' } as unknown as object)
      : ({ boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transition: 'all 0.2s ease' } as unknown as object);
  }, [isHovered]);

  const hasPhoto = photoCount > 0 && Boolean(property.photos?.[0]);

  return (
    <Pressable
      style={[styles.card, { width }, hoverStyle]}
      onPress={onPress}
      onHoverIn={() => { if (Platform.OS === 'web') setIsHovered(true); }}
      onHoverOut={() => { if (Platform.OS === 'web') setIsHovered(false); }}>
      {/* 왼쪽: 사진 영역 (정사각형) */}
      <View style={styles.photo}>
        {hasPhoto ? (
          <Image source={{ uri: property.photos![0] }} style={styles.photoImg} resizeMode="cover" />
        ) : (
          <View style={styles.photoEmpty}>
            <Text style={styles.photoEmoji}>📷</Text>
          </View>
        )}
        {/* 사진 장수 뱃지 */}
        {photoCount > 0 && (
          <View style={styles.photoBadge}>
            <Text style={styles.photoBadgeText}>{photoCount}장</Text>
          </View>
        )}
      </View>

      {/* 오른쪽: 텍스트 영역 */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.addr} numberOfLines={1}>📍 {property.addr}</Text>
        <Text style={[styles.price, { color: priceColor }]} numberOfLines={1}>
          {property.deal} {property.price}
        </Text>
        {/* 하단 칩 */}
        <View style={styles.chipRow}>
          <View style={[styles.chip, { backgroundColor: typeChip.bg }]}>
            <Text style={[styles.chipText, { color: typeChip.text }]}>{property.type}</Text>
          </View>
          {Boolean(property.area) && (
            <View style={styles.chip}>
              <Text style={styles.chipText}>{property.area}</Text>
            </View>
          )}
          {Boolean(createdDate) && (
            <View style={styles.chip}>
              <Text style={styles.chipText}>{createdDate}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const isWeb = Platform.OS === 'web';

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    ...makeShadow(2, 8, 0.06, 2),
  },
  photo:          { width: '33.3%', aspectRatio: 1, borderRadius: 8, overflow: 'hidden', backgroundColor: '#F1F5F9', position: 'relative' },
  photoImg:       { width: '100%', height: '100%' },
  photoEmpty:     { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E2E8F0' },
  photoEmoji:     { fontSize: 22 },
  photoBadge:     { position: 'absolute', bottom: 4, left: 4, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  photoBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  info:           { flex: 1, paddingLeft: 12, gap: 4 },
  title:          { fontSize: isWeb ? 20 : 15, fontWeight: '700', color: '#0F172A' },
  addr:           { fontSize: 11, color: '#64748B' },
  price:          { fontSize: isWeb ? 21 : 16, fontWeight: '800' },
  chipRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 2 },
  chip:           { backgroundColor: '#F1F5F9', borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2 },
  chipText:       { fontSize: 11, color: '#475569', fontWeight: '600' },
});