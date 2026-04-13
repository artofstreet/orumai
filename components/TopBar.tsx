import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

import * as Colors from '@/constants/colors';
import { getHorizontalPadding } from '@/constants/theme';

// TODO-AUTH: 로그인·역할에 따라 헤더 액션 노출 제어 시 이 컴포넌트에서 분기
// TODO-STORAGE: 마지막 선택 탭 등 로컬 상태 연동 시 props 확장

export type TopBarProps = {
  onLogoPress?:     () => void; // 로고(홈) 탭 콜백
  onRegisterPress?: () => void;
  onProfilePress?:  () => void;
  onPrintPress?:    () => void;
  onNotificationPress?: () => void;
  propertyCount?:   number;
  customerCount?:   number;
  // TODO-DB: Supabase 연동 후 실제 알림 수로 교체
  notifCount?:      number;
};

export default function TopBar({
  onLogoPress,
  onRegisterPress,
  onProfilePress,
  onPrintPress,
  onNotificationPress,
  propertyCount = 10,
  customerCount = 10,
  notifCount = 0,
}: TopBarProps) {
  const router = useRouter(); // expo-router 인스턴스 (목록 이동)
  const { width } = useWindowDimensions();
  const pad = useMemo(() => getHorizontalPadding(width), [width]);
  const showPrint = width >= 768;
  const compact = width < 400;
  const showCenter = width >= 600;

  const [isAddHovered, setIsAddHovered] = useState<boolean>(false);
  const [isPrintHovered, setIsPrintHovered] = useState<boolean>(false);
  const [isBellHovered, setIsBellHovered] = useState<boolean>(false);
  const [isProfileHovered, setIsProfileHovered] = useState<boolean>(false);
  // 웹 전용: 트랜지션 공통 스타일
  const webShadowStyle = useMemo<ViewStyle>(() => (
    Platform.select({ web: { transition: 'all 0.2s ease' }, default: {} }) as ViewStyle
  ), []);

  // 웹 전용: hover 시 그림자 토글
  const getWebHoverShadow = useCallback((isHovered: boolean): ViewStyle => (
    Platform.select({
      web: isHovered ? { boxShadow: '0 4px 12px rgba(0,0,0,0.4)' } : { boxShadow: 'none' },
      default: {},
    }) as ViewStyle
  ), []);

  // 전체 목록 페이지 이동
  const goToList = useCallback((type: 'properties' | 'customers') => {
    router.push({ pathname: '/list', params: { type } });
  }, [router]);

  // 로고 영역 탭 → 부모 onLogoPress
  const handleLogoPress = useCallback(() => {
    onLogoPress?.();
  }, [onLogoPress]);

  return (
    <>
      <View style={[styles.container, { paddingHorizontal: pad }]}>

        {/* 왼쪽 로고 — 웹/네이티브 동일 Touchable + SVG 마크 */}
        <TouchableOpacity
          style={styles.left}
          activeOpacity={0.85}
          onPress={handleLogoPress}
          accessibilityRole="link"
          accessibilityLabel="홈으로">
          <View style={styles.logoBox}>
            {/* 산 실루엣 마크 (뒤쪽 윤곽 + 앞쪽 반투명 면) */}
            <Svg width={22} height={16} viewBox="0 0 22 16">
              {/* 뒤쪽 산 */}
              <Polygon points="2,15 11,2 20,15" fill="none" stroke="white" strokeWidth={1.5} />
              {/* 앞쪽 산 */}
              <Polygon points="0,15 7,6 14,15" fill="white" opacity={0.5} />
            </Svg>
          </View>
          <Text style={styles.logoText}>오름AI</Text>
        </TouchableOpacity>

        {/* 중앙 매물/고객 카운트 — 클릭 시 전체 목록 이동 */}
        {showCenter && (
          <View style={styles.center}>
            <Pressable
              style={[styles.countBox, styles.countPressable]}
              onPress={() => goToList('properties')}
              accessibilityLabel="매물 전체 목록 보기">
              <Text style={styles.countLabel}>🏠 매물</Text>
              <Text style={styles.countNum}>{propertyCount}</Text>
            </Pressable>
            <View style={styles.centerDivider} />
            <Pressable
              style={[styles.countBox, styles.countPressable]}
              onPress={() => goToList('customers')}
              accessibilityLabel="고객 전체 목록 보기">
              <Text style={styles.countLabel}>👤 고객</Text>
              <Text style={styles.countNum}>{customerCount}</Text>
            </Pressable>
          </View>
        )}

        {/* 오른쪽 버튼들 */}
        <View style={[styles.right, compact && styles.rightCompact]}>
          <Pressable
            style={[styles.addButton, webShadowStyle, getWebHoverShadow(isAddHovered)]}
            onPress={() => onRegisterPress?.()}
            accessibilityLabel="매물 또는 고객 등록"
            onHoverIn={() => { if (Platform.OS === 'web') setIsAddHovered(true); }}
            onHoverOut={() => { if (Platform.OS === 'web') setIsAddHovered(false); }}>
            <Text style={styles.addButtonText}>+등록</Text>
          </Pressable>

          {showPrint && (
            <Pressable
              style={[styles.iconButton, webShadowStyle, getWebHoverShadow(isPrintHovered)]}
              onPress={() => onPrintPress?.()}
              accessibilityLabel="전체 인쇄"
              onHoverIn={() => { if (Platform.OS === 'web') setIsPrintHovered(true); }}
              onHoverOut={() => { if (Platform.OS === 'web') setIsPrintHovered(false); }}>
              <Ionicons name="print-outline" size={20} color="#FFFFFF" />
            </Pressable>
          )}

          <Pressable
            style={[styles.iconButton, webShadowStyle, getWebHoverShadow(isBellHovered)]}
            onPress={() => onNotificationPress?.()}
            accessibilityLabel="알림 패널 열기"
            onHoverIn={() => { if (Platform.OS === 'web') setIsBellHovered(true); }}
            onHoverOut={() => { if (Platform.OS === 'web') setIsBellHovered(false); }}>
            <View style={styles.bellIconWrap}>
              <Ionicons name="notifications" size={20} color="#FFC107" />
              {notifCount > 0 && (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeTxt}>{notifCount > 99 ? '99+' : notifCount}</Text>
                </View>
              )}
            </View>
          </Pressable>

          <Pressable
            style={[styles.iconButton, webShadowStyle, getWebHoverShadow(isProfileHovered)]}
            onPress={() => onProfilePress?.()}
            accessibilityLabel="프로필 보기"
            onHoverIn={() => { if (Platform.OS === 'web') setIsProfileHovered(true); }}
            onHoverOut={() => { if (Platform.OS === 'web') setIsProfileHovered(false); }}>
            <Ionicons name="person-circle-outline" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container:     { minHeight: 56, backgroundColor: Colors.topbar, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  left:          { flexDirection: 'row', alignItems: 'center', flexShrink: 1, minWidth: 0 },
  logoBox:       { width: 26, height: 26, borderRadius: 6, backgroundColor: '#1D4ED8', alignItems: 'center', justifyContent: 'center' },
  logoText:      { color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginLeft: 7, flexShrink: 0 },
  center:        { flexDirection: 'row', alignItems: 'center', gap: 16, position: 'absolute', left: 0, right: 0, justifyContent: 'center', pointerEvents: 'none' },
  countBox:      { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
  countPressable: { pointerEvents: 'auto' },
  countLabel:    { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  countNum:      { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  centerDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.15)' },
  right:         { flexDirection: 'row', alignItems: 'center', flexShrink: 0, gap: 6 },
  rightCompact:  { gap: 4 },
  addButton:     { backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155', borderRadius: 7, paddingHorizontal: 10, paddingVertical: 6 },
  addButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  iconButton:    { backgroundColor: '#1E293B', borderRadius: 18, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  // 배지 absolute 기준점 — 아이콘과 동일 부모
  bellIconWrap:  { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  bellBadge:     { position: 'absolute', top: -4, right: -4, zIndex: 10, backgroundColor: '#EF4444', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  bellBadgeTxt:  { color: '#fff', fontSize: 9, fontWeight: '700' },
});
