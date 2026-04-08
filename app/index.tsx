import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { router } from 'expo-router';

import SearchBar from '@/components/SearchBar';
import { bg, primary, text, text2 } from '@/constants/colors';
import { getContentMaxWidth, getHorizontalPadding } from '@/constants/theme';

export default function HomeScreen() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const layoutPadding = useMemo(() => getHorizontalPadding(windowWidth), [windowWidth]);
  const contentMax = useMemo(() => getContentMaxWidth(windowWidth), [windowWidth]);
  const logoFontSize = windowWidth < 400 ? 36 : windowWidth < 768 ? 44 : 52;
  const paddingTop = Math.min(220, Math.max(72, Math.floor(windowHeight * 0.2)));

  const [검색어, set검색어] = useState<string>('');

  const 검색실행 = () => {
    router.push(
      {
        pathname: '/results',
        params: { query: 검색어 },
      } as unknown as Parameters<typeof router.push>[0],
    );
  };

  return (
    <View style={styles.page}>
      <View
        style={[
          styles.main,
          {
            paddingHorizontal: layoutPadding,
            paddingTop,
            maxWidth: contentMax,
            alignSelf: 'center',
            width: '100%',
          },
        ]}>
        <Text style={[styles.logo, { fontSize: logoFontSize }]}>
          <Text style={styles.logoO}>오름</Text>
          <Text style={styles.logoAI}>AI</Text>
        </Text>
        <Text style={styles.subtitle}>AI 부동산 CRM</Text>

        <SearchBar value={검색어} onChangeText={set검색어} onSubmit={검색실행} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: bg,
  },
  main: {
    flex: 1,
    alignItems: 'center',
    gap: 14,
  },
  logo: {
    fontWeight: '800',
  },
  logoO: {
    color: text,
  },
  logoAI: {
    color: primary,
  },
  subtitle: {
    color: text2,
    fontSize: 16,
    fontWeight: '600',
  },
});