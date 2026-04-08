import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { getHorizontalPadding } from '@/constants/theme';
import { router } from 'expo-router';
import NotificationPanel from './NotificationPanel';

export type TopBarProps = {
  onRegisterPress?: () => void;
  onProfilePress?: () => void;
  onPrintPress?: () => void;
  notifPanelW?: number;
  propertyCount?: number;
  customerCount?: number;
};

export default function TopBar({ onRegisterPress, onProfilePress, onPrintPress, notifPanelW, propertyCount = 10, customerCount = 10 }: TopBarProps) {
  const { width } = useWindowDimensions();
  const pad = useMemo(() => getHorizontalPadding(width), [width]);
  const showPrint = width >= 768;
  const compact = width < 400;
  const showCenter = width >= 600;

  const [isAddHovered, setIsAddHovered] = useState<boolean>(false);
  const [isPrintHovered, setIsPrintHovered] = useState<boolean>(false);
  const [isBellHovered, setIsBellHovered] = useState<boolean>(false);
  const [isProfileHovered, setIsProfileHovered] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);

  const webShadowStyle = useMemo(() => {
    if (Platform.OS !== 'web') return null;
    return { transition: 'all 0.2s ease' } as unknown as object;
  }, []);

  const getWebHoverShadow = (isHovered: boolean) => {
    if (Platform.OS !== 'web') return null;
    return (isHovered ? { boxShadow: '0 4px 12px rgba(0,0,0,0.4)' } : { boxShadow: 'none' }) as unknown as object;
  };

  return (
    <>
      <View style={[styles.container, { paddingHorizontal: pad }]}>

        {/* 왼쪽 로고 */}
        <Pressable style={styles.left} onPress={() => router.push('/')}>
          {Platform.OS === 'web' ? (
            <div style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1D4ED8', borderRadius: 6 }}>
              <svg width="26" height="26" viewBox="0 0 80 80">
                <polyline points="10,58 28,34 40,44 54,22 70,58" fill="none" stroke="#fff" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
            </div>
          ) : (
            <View style={styles.logoBox}>
              <Text style={styles.logoO}>오</Text>
            </View>
          )}
          <Text style={styles.logoText}>오름AI</Text>
        </Pressable>

        {/* 중앙 매물/고객 카운트 */}
        {showCenter && (
          <View style={styles.center}>
            <View style={styles.countBox}>
              <Text style={styles.countLabel}>🏠 매물</Text>
              <Text style={styles.countNum}>{propertyCount}</Text>
            </View>
            <View style={styles.centerDivider} />
            <View style={styles.countBox}>
              <Text style={styles.countLabel}>👤 고객</Text>
              <Text style={styles.countNum}>{customerCount}</Text>
            </View>
          </View>
        )}

        {/* 오른쪽 버튼들 */}
        <View style={[styles.right, compact && styles.rightCompact]}>
          <Pressable
            style={[styles.addButton, webShadowStyle, getWebHoverShadow(isAddHovered)]}
            onPress={() => onRegisterPress?.()}
            onHoverIn={() => { if (Platform.OS === 'web') setIsAddHovered(true); }}
            onHoverOut={() => { if (Platform.OS === 'web') setIsAddHovered(false); }}>
            <Text style={styles.addButtonText}>+등록</Text>
          </Pressable>

          {showPrint && (
            <Pressable
              style={[styles.iconButton, webShadowStyle, getWebHoverShadow(isPrintHovered)]}
              onPress={() => onPrintPress?.()}
              onHoverIn={() => { if (Platform.OS === 'web') setIsPrintHovered(true); }}
              onHoverOut={() => { if (Platform.OS === 'web') setIsPrintHovered(false); }}>
              <Ionicons name="print-outline" size={20} color="#FFFFFF" />
            </Pressable>
          )}

          <Pressable
            style={[styles.iconButton, webShadowStyle, getWebHoverShadow(isBellHovered)]}
            onPress={() => setShowNotification(true)}
            onHoverIn={() => { if (Platform.OS === 'web') setIsBellHovered(true); }}
            onHoverOut={() => { if (Platform.OS === 'web') setIsBellHovered(false); }}>
            <View>
              <Ionicons name="notifications" size={20} color="#FFC107" />
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeTxt}>3</Text>
              </View>
            </View>
          </Pressable>

          <Pressable
            style={[styles.iconButton, webShadowStyle, getWebHoverShadow(isProfileHovered)]}
            onPress={() => onProfilePress?.()}
            onHoverIn={() => { if (Platform.OS === 'web') setIsProfileHovered(true); }}
            onHoverOut={() => { if (Platform.OS === 'web') setIsProfileHovered(false); }}>
            <Ionicons name="person-circle-outline" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      {/* 알림 패널 */}
      <NotificationPanel
        visible={showNotification}
        onClose={() => setShowNotification(false)}
        panelW={notifPanelW}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container:    { minHeight: 56, backgroundColor: '#0F172A', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  left:         { flexDirection: 'row', alignItems: 'center', flexShrink: 1, minWidth: 0 },
  logoBox:      { width: 26, height: 26, borderRadius: 6, backgroundColor: '#1D4ED8', alignItems: 'center', justifyContent: 'center' },
  logoO:        { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  logoText:     { color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginLeft: 7, flexShrink: 0 },
  center:       { flexDirection: 'row', alignItems: 'center', gap: 16, position: 'absolute', left: 0, right: 0, justifyContent: 'center', pointerEvents: 'none' },
  countBox:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  countLabel:   { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  countNum:     { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  centerDivider:{ width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.15)' },
  right:        { flexDirection: 'row', alignItems: 'center', flexShrink: 0, gap: 6 },
  rightCompact: { gap: 4 },
  addButton:    { backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155', borderRadius: 7, paddingHorizontal: 10, paddingVertical: 6 },
  addButtonText:{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  iconButton:   { backgroundColor: '#1E293B', borderRadius: 18, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  bellBadge:    { position: 'absolute', top: -4, right: -4, backgroundColor: '#EF4444', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  bellBadgeTxt: { color: '#fff', fontSize: 9, fontWeight: '700' },
});