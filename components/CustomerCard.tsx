import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Customer } from '@/types';

const isWeb = Platform.OS === 'web';

// 고객 아바타 배경색(첫 글자 charCode 기반 선택)
const 아바타배경색배열 = [
  '#1A56DB', '#0E7A4F', '#7E22CE', '#C2610C',
  '#BE123C', '#0369A1', '#166534', '#92400E',
];

const getInitialChar = (name: string): string => {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed[0] : '?'; // 이름 첫 글자(없으면 '?')
};

const getAvatarBackgroundColor = (name: string): string => {
  const initial = getInitialChar(name);
  const code = initial.charCodeAt(0);
  return 아바타배경색배열[code % 아바타배경색배열.length]; // charCode 기반 색상 순환 선택
};

const formatCreatedAt = (createdAt: string): string => {
  if (!createdAt) return '';
  return createdAt.slice(0, 10);
};

export type CustomerCardProps = {
  item: Customer;  // 카드에 표시할 고객
  width?: number;  // 카드 너비(results.tsx에서 반응형 계산 후 전달)
};

export default function CustomerCard({ item, width }: CustomerCardProps) {
  const router = useRouter();

  const initial         = useMemo(() => getInitialChar(item.name), [item.name]);
  const avatarBg        = useMemo(() => getAvatarBackgroundColor(item.name), [item.name]);
  const createdDateText = useMemo(() => formatCreatedAt(item.createdAt), [item.createdAt]);

  const [isHovered, setIsHovered] = useState<boolean>(false);
  const hoverStyle = useMemo(() => {
    if (Platform.OS !== 'web') return null;
    return isHovered
      ? ({ transform: [{ translateY: -2 }], transition: 'all 0.2s ease' } as unknown as object)
      : ({ transition: 'all 0.2s ease' } as unknown as object);
  }, [isHovered]);

  return (
    <Pressable
      style={[styles.card, width !== undefined ? { width } : null, hoverStyle]}
      accessibilityRole="button"
      accessibilityLabel={`${item.name} 고객 상세보기`}
      onPress={() => {
        router.push({ pathname: '/customer/[id]', params: { id: item.id } });
      }}
      onHoverIn={() => { if (Platform.OS === 'web') setIsHovered(true); }}
      onHoverOut={() => { if (Platform.OS === 'web') setIsHovered(false); }}>
      <View style={styles.leftRow}>
        <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.textArea}>
          <Text style={styles.name} numberOfLines={1}>{item.name || '이름 없음'}</Text>
          <Text style={styles.phone} numberOfLines={1}>{item.phone}</Text>
        </View>
      </View>
      <Text style={styles.date}>{createdDateText}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    height: 160,
    justifyContent: 'center',
  },
  leftRow:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar:     { width: 44, height: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  textArea:   { flex: 1 },
  name:       { fontSize: isWeb ? 18 : 15, fontWeight: '600', color: '#0F172A' },
  phone:      { fontSize: isWeb ? 15 : 13, fontWeight: '700', color: '#64748B', marginTop: 2 },
  date:       { fontSize: isWeb ? 14 : 12, fontWeight: '600', color: '#64748B', position: 'absolute', bottom: 12, right: 12 },
});