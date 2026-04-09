import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

import SearchBar from '@/components/SearchBar';
import { bg, primary, text, text2 } from '@/constants/colors';
import { getContentMaxWidth, getHorizontalPadding } from '@/constants/theme';

export default function HomeScreen() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const layoutPadding = useMemo(() => getHorizontalPadding(windowWidth), [windowWidth]);
  const contentMax = useMemo(() => getContentMaxWidth(windowWidth), [windowWidth]);
  const logoFontSize = useMemo(
    () => windowWidth < 400 ? 36 : windowWidth < 768 ? 44 : 52,
    [windowWidth],
  );
  const paddingTop = useMemo(
    () => Math.min(220, Math.max(72, Math.floor(windowHeight * 0.2))),
    [windowHeight],
  );

  const [검색어, set검색어] = useState<string>('');
  const inputRef = useRef<TextInput>(null);

  const focusInput = useCallback(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  // 네비게이션 복귀 시 포커스
  useFocusEffect(
    useCallback(() => {
      focusInput();
    }, [focusInput])
  );

  // 브라우저 window focus + 인쇄 후 포커스 (web 전용)
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handleFocus = () => focusInput();
    const handleAfterPrint = () => focusInput(); // 인쇄 다이얼로그 닫힌 후
    window.addEventListener('focus', handleFocus);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
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

        <SearchBar ref={inputRef} value={검색어} onChangeText={set검색어} onSubmit={검색실행} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page:     { flex: 1, backgroundColor: bg },
  main:     { flex: 1, alignItems: 'center', gap: 14 },
  logo:     { fontWeight: '800' },
  logoO:    { color: text },
  logoAI:   { color: primary },
  subtitle: { color: text2, fontSize: 16, fontWeight: '600' },
});