import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Customer } from '@/types';

import { card as cardColor, text2 } from '@/constants/colors';

// 고객 아바타 배경색(첫 글자 charCode 기반 선택)
const 아바타배경색배열 = [
  '#1A56DB',
  '#0E7A4F',
  '#7E22CE',
  '#C2610C',
  '#BE123C',
  '#0369A1',
  '#166534',
  '#92400E',
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
  item: Customer; // 카드에 표시할 고객
  width?: number; // 카드 너비(results.tsx에서 반응형 계산 후 전달)
};

export default function CustomerCard({ item, width }: CustomerCardProps) {
  const router = useRouter();

  const initial = useMemo(() => getInitialChar(item.name), [item.name]);
  const avatarBg = useMemo(() => getAvatarBackgroundColor(item.name), [item.name]);
  const createdDateText = useMemo(() => formatCreatedAt(item.createdAt), [item.createdAt]);

  const [isHovered, setIsHovered] = useState<boolean>(false);
  const hoverStyle = useMemo(() => {
    if (Platform.OS !== 'web') return null;
    return isHovered
      ? ({ boxShadow: '0 4px 12px rgba(0,0,0,0.14)', transform: [{ translateY: -2 }], transition: 'all 0.2s ease' } as unknown as object)
      : ({ boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transition: 'all 0.2s ease' } as unknown as object);
  }, [isHovered]);

  return (
    <Pressable
      style={[styles.card, width !== undefined ? { width } : null, hoverStyle]}
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
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.phone} numberOfLines={1}>
            {item.phone}
          </Text>
        </View>
      </View>

      <Text style={styles.memo} numberOfLines={2} ellipsizeMode="tail">
        {item.memo}
      </Text>

      <Text style={styles.date}>{createdDateText}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: cardColor,
    borderRadius: 16,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  textArea: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  phone: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
  },
  memo: {
    fontSize: 13,
    fontWeight: '600',
    color: text2,
  },
  date: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
});