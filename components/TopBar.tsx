import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { getHorizontalPadding } from '@/constants/theme';
import { router } from 'expo-router';

export type TopBarProps = {
  onRegisterPress?: () => void; // +등록 버튼 콜백 (_layout에서 패널 열기)
};

// TopBar 컴포넌트: 상단 네비/통계/액션을 보여줍니다.
export default function TopBar({ onRegisterPress }: TopBarProps) {
  const { width } = useWindowDimensions();
  const pad = useMemo(() => getHorizontalPadding(width), [width]);
  const showPrint = width >= 768; // 태블릿 이상에서 인쇄 버튼
  const compact = width < 400;

  const [isAddHovered, setIsAddHovered] = useState<boolean>(false); // "+등록" hover 상태(웹)
  const [isPrintHovered, setIsPrintHovered] = useState<boolean>(false); // 인쇄 hover 상태(웹)
  const [isBellHovered, setIsBellHovered] = useState<boolean>(false); // 알림 hover 상태(웹)
  const [isProfileHovered, setIsProfileHovered] = useState<boolean>(false); // 프로필 hover 상태(웹)

  const webShadowStyle = useMemo(() => {
    // 웹에서만 boxShadow/transition 적용(타입 안전을 위해 unknown 캐스팅)
    if (Platform.OS !== 'web') return null;
    return { transition: 'all 0.2s ease' } as unknown as object;
  }, []);

  const getWebHoverShadow = (isHovered: boolean) => {
    if (Platform.OS !== 'web') return null;
    return (isHovered ? { boxShadow: '0 4px 12px rgba(0,0,0,0.4)' } : { boxShadow: 'none' }) as unknown as object;
  };

  return (
    <View style={[styles.container, { paddingHorizontal: pad }]}>
      <Pressable style={styles.left} onPress={() => router.push('/')}>
        {Platform.OS === 'web' ? (
          <div
            style={{
              width: 26,
              height: 26,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#1D4ED8',
              borderRadius: 6,
            }}>
            <svg width="26" height="26" viewBox="0 0 80 80">
              <polyline
                points="10,58 28,34 40,44 54,22 70,58"
                fill="none"
                stroke="#fff"
                strokeWidth="4"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </div>
        ) : (
          <View style={styles.logoBox}>
            <Text style={styles.logoO}>오</Text>
          </View>
        )}
        <Text style={styles.logoText}>오름AI</Text>
      </Pressable>

      <View style={[styles.right, compact && styles.rightCompact]}>
        <Pressable
          style={[styles.addButton, webShadowStyle, getWebHoverShadow(isAddHovered)]}
          onPress={() => {
            onRegisterPress?.(); // _layout 전역 패널 열기
          }}
          onHoverIn={() => {
            if (Platform.OS === 'web') setIsAddHovered(true);
          }}
          onHoverOut={() => {
            if (Platform.OS === 'web') setIsAddHovered(false);
          }}>
          <Text style={styles.addButtonText}>+등록</Text>
        </Pressable>

        {showPrint && (
          <Pressable
            style={[styles.iconButton, webShadowStyle, getWebHoverShadow(isPrintHovered)]}
            onPress={() => {}}
            onHoverIn={() => {
              if (Platform.OS === 'web') setIsPrintHovered(true);
            }}
            onHoverOut={() => {
              if (Platform.OS === 'web') setIsPrintHovered(false);
            }}>
            <Ionicons name="print-outline" size={20} color="#FFFFFF" />
          </Pressable>
        )}
        <Pressable
          style={[styles.iconButton, webShadowStyle, getWebHoverShadow(isBellHovered)]}
          onPress={() => {}}
          onHoverIn={() => {
            if (Platform.OS === 'web') setIsBellHovered(true);
          }}
          onHoverOut={() => {
            if (Platform.OS === 'web') setIsBellHovered(false);
          }}>
          <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
        </Pressable>
        <Pressable
          style={[styles.iconButton, webShadowStyle, getWebHoverShadow(isProfileHovered)]}
          onPress={() => router.push('/profile')}
          onHoverIn={() => {
            if (Platform.OS === 'web') setIsProfileHovered(true);
          }}
          onHoverOut={() => {
            if (Platform.OS === 'web') setIsProfileHovered(false);
          }}>
          <Ionicons name="person-circle-outline" size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

// 스타일 정의
const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    minWidth: 0,
  },
  logoBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoO: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 7,
    flexShrink: 0,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: 6,
  },
  rightCompact: {
    gap: 4,
  },
  addButton: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  iconButton: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});