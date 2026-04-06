import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import TopBar from '@/components/TopBar';
import { bg } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import PropertyRegisterScreen from './property/register';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme(); // 현재 색상 스킴(라이트/다크)
  const { width: windowWidth } = useWindowDimensions();

  const [registerOpen, setRegisterOpen] = useState<boolean>(false); // 등록 패널 열림 여부

  const panelW = useMemo(() => { // 패널 너비(모바일 전체 / 데스크탑 480)
    if (windowWidth < 768) return windowWidth;
    return Math.min(480, Math.floor(windowWidth * 0.92));
  }, [windowWidth]);

  const slideX = useRef(new Animated.Value(panelW)).current; // 슬라이드 애니메이션

  useEffect(() => {
    if (!registerOpen) slideX.setValue(panelW);
  }, [panelW, slideX, registerOpen]);

  const openPanel = useCallback(() => { // 패널 열기
    slideX.setValue(panelW);
    setRegisterOpen(true);
  }, [panelW, slideX]);

  useEffect(() => {
    if (!registerOpen) return;
    Animated.timing(slideX, {
      toValue: 0,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [registerOpen, slideX]);

  const closePanel = useCallback(() => { // 패널 닫기
    Animated.timing(slideX, {
      toValue: panelW,
      duration: 260,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setRegisterOpen(false);
    });
  }, [panelW, slideX]);

  useEffect(() => {
    // 웹에서 입력 포커스 시 검은 outline 제거(글로벌)
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.innerHTML = `input:focus { outline: none !important; }`;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <TopBar onRegisterPress={openPanel} />
          <View style={styles.content}>
            {/* TODO-AUTH: 여기서 Supabase 세션 확인 후 로그인 화면 분기 */}
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: bg },
              }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="results" />
              <Stack.Screen name="property/[id]" />
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            </Stack>
          </View>

          {/* 전역 등록 패널 — 모든 화면 위에 오버레이 */}
          {registerOpen && (
            <>
              <Pressable style={styles.backdrop} onPress={closePanel} accessibilityRole="button" />
              <Animated.View style={[styles.panel, { width: panelW, transform: [{ translateX: slideX }] }]}>
                <PropertyRegisterScreen embedded />
              </Animated.View>
            </>
          )}
        </SafeAreaView>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: bg,
  },
  content: {
    flex: 1,
  },
  backdrop: { // 배경 어둡게
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    zIndex: 20,
  },
  panel: { // 슬라이드 등록 패널
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 21,
    borderLeftWidth: 1,
    borderLeftColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
  },
});