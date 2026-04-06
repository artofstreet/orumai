import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import TopBar from '@/components/TopBar';
import { bg } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { registerOpenPanel } from '@/utils/registerEvents';
import CustomerRegisterScreen from './customer/register';
import PropertyRegisterScreen from './property/register';

export const unstable_settings = { anchor: '(tabs)' };

type RegisterKind = 'property' | 'customer'; // 등록 종류

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { width: windowWidth } = useWindowDimensions();

  const [selectModalVisible, setSelectModalVisible] = useState<boolean>(false); // 매물/고객 선택 모달
  const [registerKind, setRegisterKind] = useState<RegisterKind | null>(null); // 선택된 등록 종류
  const [registerOpen, setRegisterOpen] = useState<boolean>(false); // 슬라이드 패널 열림
  const [panelKey, setPanelKey] = useState<number>(0); // 패널 재마운트용 키
  const [panelEditData, setPanelEditData] = useState<Record<string, unknown> | null>(null); // 편집 데이터

  const panelW = useMemo(() => {
    if (windowWidth < 768) return windowWidth;
    return Math.min(480, Math.floor(windowWidth * 0.92));
  }, [windowWidth]);

  const slideX = useRef(new Animated.Value(panelW)).current;

  useEffect(() => {
    if (!registerOpen) slideX.setValue(panelW);
  }, [panelW, slideX, registerOpen]);

  /** 패널 열기 — 매물/고객 선택 + editId 옵션 */
  const openPanel = useCallback((kind: RegisterKind, editId?: string, editData?: Record<string, unknown>) => {
    console.log('openPanel 호출:', kind, editData); // 디버그
    setPanelEditData(editData ?? null); // 편집 데이터 직접 저장
    setRegisterKind(kind);
    slideX.setValue(panelW);
    setPanelKey((k) => k + 1);
    setRegisterOpen(true);
  }, [panelW, slideX]);

  /** +등록 버튼 → 선택 모달 열기 */
  const openSelectModal = useCallback(() => {
    setSelectModalVisible(true);
  }, []);

  /** 매물/고객 선택 → 패널 열기 */
  const onSelectKind = useCallback((kind: RegisterKind) => {
    setSelectModalVisible(false);
    openPanel(kind);
  }, [openPanel]);

  /** 전역 패널 열기 함수 등록 — 다른 화면에서 호출 가능 */
  useEffect(() => {
    registerOpenPanel(openPanel);
  }, [openPanel]);

  useEffect(() => {
    if (!registerOpen) return;
    Animated.timing(slideX, {
      toValue: 0,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [registerOpen, slideX]);

  const closePanel = useCallback(() => {
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
          <TopBar onRegisterPress={openSelectModal} />
          <View style={styles.content}>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: bg } }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="results" />
              <Stack.Screen name="property/[id]" />
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            </Stack>
          </View>

          {/* 매물/고객 선택 모달 */}
          <Modal
            visible={selectModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setSelectModalVisible(false)}>
            <Pressable style={styles.modalBackdrop} onPress={() => setSelectModalVisible(false)}>
              <View style={styles.modalCard}>
                <TouchableOpacity style={styles.modalOptionRow} onPress={() => onSelectKind('property')}>
                  <Text style={styles.modalOptionTxt}>🏠 매물 등록</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalOptionRow, { borderTopWidth: 1, borderTopColor: '#F1F5F9' }]} onPress={() => onSelectKind('customer')}>
                  <Text style={styles.modalOptionTxt}>👤 고객 등록</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Modal>

          {/* 전역 슬라이드 패널 */}
          {registerOpen && (
            <>
              <Pressable style={styles.backdrop} onPress={closePanel} accessibilityRole="button" />
              <Animated.View style={[styles.panel, { width: panelW, transform: [{ translateX: slideX }] }]}>
                {registerKind === 'property'
                  ? <PropertyRegisterScreen key={panelKey} embedded initialData={panelEditData} />
                  : <CustomerRegisterScreen key={panelKey} embedded initialData={panelEditData} />}
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
  container: { flex: 1, backgroundColor: bg },
  content: { flex: 1 },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    zIndex: 20,
  },
  panel: {
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
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 56,
    paddingRight: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  modalOptionRow: { paddingVertical: 14, paddingHorizontal: 20 },
  modalOptionTxt: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
});