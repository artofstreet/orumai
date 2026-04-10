import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Platform, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

import SearchBar from '@/components/SearchBar';
import { bg, primary, text, text2 } from '@/constants/colors';
import { getContentMaxWidth, getHorizontalPadding } from '@/constants/theme';

export default function HomeScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const layoutPadding = useMemo(() => getHorizontalPadding(windowWidth), [windowWidth]);
  const contentMax = useMemo(() => getContentMaxWidth(windowWidth), [windowWidth]);
  const logoFontSize = useMemo(
    () => windowWidth < 400 ? 36 : windowWidth < 768 ? 44 : 52,
    [windowWidth],
  );
  const mainPaddingTop = Math.floor(Dimensions.get('window').height * 0.22);

  const [검색어, set검색어] = useState<string>('');
  const inputRef = useRef<TextInput>(null);

  const focusInput = useCallback(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  // 브라우저 window focus (web 전용) → 인쇄 후 iframe 닫히면 자동 트리거
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handleFocus = () => focusInput();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [focusInput]);

  const 검색실행 = () => {
    (router.push as Function)({ pathname: '/results', params: { query: 검색어 } });
  };

  return (
    <View style={styles.page}>
      <View
        style={[
          styles.main,
          {
            paddingHorizontal: layoutPadding,
            paddingTop: mainPaddingTop,
            marginBottom: 40,
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

        <SearchBar ref={inputRef} value={검색어} onChangeText={set검색어} onSubmit={검색실행} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page:     { flex: 1, backgroundColor: bg },
  // 로고·검색창 블록: 상단부터 배치 · 하단 여백은 바로가기 영역 예정
  main:     { flex: 1, justifyContent: 'flex-start', alignItems: 'center', gap: 14 },
  logo:     { fontWeight: '800' },
  logoO:    { color: text },
  logoAI:   { color: primary },
  subtitle: { color: text2, fontSize: 16, fontWeight: '600' },
});