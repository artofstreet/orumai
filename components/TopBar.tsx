import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import type { ViewStyle } from 'react-native';
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

import * as Colors from '@/constants/colors';
import { getHorizontalPadding } from '@/constants/theme';

// TODO-AUTH: 로그인·역할에 따라 헤더 액션 노출 제어 시 이 컴포넌트에서 분기
// TODO-STORAGE: 마지막 선택 탭 등 로컬 상태 연동 시 props 확장

export type TopBarProps = {
  onLogoPress?:         () => void;
  onRegisterPress?:     () => void;
  onProfilePress?:      () => void;
  onPrintPress?:        () => void;
  onNotificationPress?: () => void;
  propertyCount?:       number;
  customerCount?:       number;
  // TODO-DB: Supabase 연동 후 실제 알림 수로 교체
  notifCount?:          number;
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
  const router = useRouter();
  const { width } = useWindowDimensions();
  const pad = useMemo(() => getHorizontalPadding(width), [width]);
  const showPrint  = width >= 768;
  const compact    = width < 400;
  const showCenter = width >= 600;
  const profileIconSize = width >= 768 ? 24 : 28;

  const [isAddHovered,     setIsAddHovered]     = useState<boolean>(false);
  const [isPrintHovered,   setIsPrintHovered]   = useState<boolean>(false);
  const [isBellHovered,    setIsBellHovered]    = useState<boolean>(false);
  const [isProfileHovered, setIsProfileHovered] = useState<boolean>(false);

  const webShadowStyle = useMemo<ViewStyle>(() => (
    Platform.select({ web: { transition: 'all 0.2s ease' }, default: {} }) as ViewStyle
  ), []);

  const getWebHoverShadow = useCallback((isHovered: boolean): ViewStyle => (
    Platform.select({
      web: isHovered ? { boxShadow: '0 4px 12px rgba(0,0,0,0.4)' } : { boxShadow: 'none' },
      default: {},
    }) as ViewStyle
  ), []);

  const goToList = useCallback((type: 'properties' | 'customers') => {
    router.push({ pathname: '/list', params: { type } });
  }, [router]);

  const handleLogoPress = useCallback(() => {
    onLogoPress?.();
  }, [onLogoPress]);

  return (
    <View style={[styles.container, { paddingHorizontal: pad }]}>

      {/* 왼쪽 로고 */}
      <TouchableOpacity
        style={styles.left}
        activeOpacity={0.85}
        onPress={handleLogoPress}
        accessibilityRole="link"
        accessibilityLabel="홈으로">
        <View style={styles.logoBox}>
          <Svg width={24} height={18} viewBox="0 0 22 16">
            <Polygon points="2,15 11,2 20,15" fill="none" stroke="white" strokeWidth={1.5} />
            <Polygon points="0,15 7,6 14,15" fill="white" opacity={0.5} />
          </Svg>
        </View>
        <Text style={styles.logoText}>오름AI</Text>
      </TouchableOpacity>

      {/* 중앙 매물/고객 카운트 */}
      {showCenter && (
        <View style={styles.center}>
          <Pressable
            hitSlop={6}
            style={[styles.countBox, styles.countPressable]}
            onPress={() => goToList('properties')}
            accessibilityLabel="매물 전체 목록 보기">
            <Text style={styles.countLabel}>🏠 매물</Text>
            <Text style={styles.countNum}>{propertyCount}</Text>
          </Pressable>
          <View style={styles.centerDivider} />
          <Pressable
            hitSlop={6}
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
          hitSlop={6}
          style={[styles.addButton, webShadowStyle, getWebHoverShadow(isAddHovered)]}
          onPress={() => onRegisterPress?.()}
          accessibilityLabel="매물 또는 고객 등록"
          onHoverIn={() => { if (Platform.OS === 'web') setIsAddHovered(true); }}
          onHoverOut={() => { if (Platform.OS === 'web') setIsAddHovered(false); }}>
          <Text style={styles.addButtonText}>등록</Text>
        </Pressable>

        {showPrint && (
          <Pressable
            hitSlop={6}
            style={[styles.iconButton, webShadowStyle, getWebHoverShadow(isPrintHovered)]}
            onPress={() => onPrintPress?.()}
            accessibilityLabel="전체 인쇄"
            onHoverIn={() => { if (Platform.OS === 'web') setIsPrintHovered(true); }}
            onHoverOut={() => { if (Platform.OS === 'web') setIsPrintHovered(false); }}>
            <Ionicons name="print-outline" size={22} color="#FFFFFF" />
          </Pressable>
        )}

        <Pressable
          hitSlop={6}
          style={[styles.iconButton, webShadowStyle, getWebHoverShadow(isBellHovered)]}
          onPress={() => onNotificationPress?.()}
          accessibilityLabel="알림 패널 열기"
          onHoverIn={() => { if (Platform.OS === 'web') setIsBellHovered(true); }}
          onHoverOut={() => { if (Platform.OS === 'web') setIsBellHovered(false); }}>
          <View style={styles.bellIconWrap}>
            <Ionicons name="notifications" size={22} color="#FFC107" />
            {notifCount > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeTxt}>{notifCount > 99 ? '99+' : notifCount}</Text>
              </View>
            )}
          </View>
        </Pressable>

        <Pressable
          hitSlop={6}
          style={[styles.iconButton, webShadowStyle, getWebHoverShadow(isProfileHovered)]}
          onPress={() => onProfilePress?.()}
          accessibilityLabel="프로필 보기"
          onHoverIn={() => { if (Platform.OS === 'web') setIsProfileHovered(true); }}
          onHoverOut={() => { if (Platform.OS === 'web') setIsProfileHovered(false); }}>
          <Ionicons name="person-circle-outline" size={profileIconSize} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { minHeight: 64, backgroundColor: Colors.topbar, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  left:           { flexDirection: 'row', alignItems: 'center', flexShrink: 1, minWidth: 0 },
  logoBox:        { width: 30, height: 30, borderRadius: 8, backgroundColor: Colors.logoBg, alignItems: 'center', justifyContent: 'center' },
  logoText:       { color: '#FFFFFF', fontSize: 17, fontWeight: '800', marginLeft: 8, flexShrink: 0 },
  center:         { flexDirection: 'row', alignItems: 'center', gap: 18, position: 'absolute', left: 0, right: 0, justifyContent: 'center', pointerEvents: 'none' },
  countBox:       { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
  countPressable: { pointerEvents: 'auto' },
  countLabel:     { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  countNum:       { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  centerDivider:  { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.15)' },
  right:          { flexDirection: 'row', alignItems: 'center', flexShrink: 0, gap: 8 },
  rightCompact:   { gap: 6 },
  addButton:      { minHeight: 38, paddingHorizontal: 14, borderRadius: 10, backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155', alignItems: 'center', justifyContent: 'center' },
  addButtonText:  { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  iconButton:     { backgroundColor: '#1E293B', borderRadius: 21, width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  bellIconWrap:   { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  bellBadge:      { position: 'absolute', top: -5, right: -6, zIndex: 10, backgroundColor: '#EF4444', borderRadius: 9, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  bellBadgeTxt:   { color: '#fff', fontSize: 9, fontWeight: '800' },
});