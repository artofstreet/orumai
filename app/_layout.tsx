import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import TopBar from '@/components/TopBar';
import { bg } from '@/constants/colors';
import { DUMMY_CUSTOMERS } from '@/constants/dummyCustomers';
import { DUMMY_PROPERTIES } from '@/constants/dummyProperties';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { printCustomerList, printPropertyList } from '@/utils/printList';
import { registerOpenPanel } from '@/utils/registerEvents';
import CustomerRegisterScreen from './customer/register';
import ProfileScreen from './profile';
import PropertyRegisterScreen from './property/register';

export const unstable_settings = { anchor: '(tabs)' };

type RegisterKind = 'property' | 'customer';

// 플랫폼별 그림자 유틸
const makeShadow = (h: number, r: number, o: number, elev: number) =>
  Platform.OS === 'web'
    ? ({ boxShadow: `0 ${h}px ${r * 2}px rgba(0,0,0,${o})` } as object)
    : { shadowColor: '#000' as const, shadowOffset: { width: 0, height: h }, shadowOpacity: o, shadowRadius: r, elevation: elev };

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { width: windowWidth } = useWindowDimensions();

  const [selectModalVisible, setSelectModalVisible] = useState<boolean>(false);
  const [printModalVisible,  setPrintModalVisible]  = useState<boolean>(false);
  const [registerKind,       setRegisterKind]       = useState<RegisterKind | null>(null);
  const [registerOpen,       setRegisterOpen]       = useState<boolean>(false);
  const [panelKey,           setPanelKey]           = useState<number>(0);
  const [panelEditData,      setPanelEditData]      = useState<Record<string, unknown> | null>(null);

  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [profileKey,  setProfileKey]  = useState<number>(0);
  const profileSlideX = useRef(new Animated.Value(0)).current;

  // 실제 매물/고객 수 (TODO-DB: Supabase 연결 후 실데이터로 교체)
  const propertyCount = DUMMY_PROPERTIES.length;
  const customerCount = DUMMY_CUSTOMERS.length;

  const panelW = useMemo(() => {
    if (windowWidth < 768) return windowWidth;
    return Math.min(480, Math.floor(windowWidth * 0.92));
  }, [windowWidth]);

  const slideX = useRef(new Animated.Value(panelW)).current;

  useEffect(() => {
    if (!registerOpen) slideX.setValue(panelW);
  }, [panelW, slideX, registerOpen]);

  useEffect(() => {
    if (!profileOpen) profileSlideX.setValue(panelW);
  }, [panelW, profileSlideX, profileOpen]);

  const openPanel = useCallback((kind: RegisterKind, editId?: string, editData?: Record<string, unknown>) => {
    setPanelEditData(editData ?? null);
    setRegisterKind(kind);
    slideX.setValue(panelW);
    setPanelKey((k) => k + 1);
    setRegisterOpen(true);
  }, [panelW, slideX]);

  const openSelectModal = useCallback(() => {
    setSelectModalVisible(true);
  }, []);

  const onSelectKind = useCallback((kind: RegisterKind) => {
    setSelectModalVisible(false);
    openPanel(kind);
  }, [openPanel]);

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

  const openProfilePanel = useCallback(() => {
    profileSlideX.setValue(panelW);
    setProfileKey((k) => k + 1);
    setProfileOpen(true);
    Animated.timing(profileSlideX, {
      toValue: 0,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [panelW, profileSlideX]);

  const closeProfilePanel = useCallback(() => {
    Animated.timing(profileSlideX, {
      toValue: panelW,
      duration: 260,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setProfileOpen(false);
    });
  }, [panelW, profileSlideX]);

  // input focus outline 제거 (웹 전용)
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
          <TopBar
            onRegisterPress={openSelectModal}
            onProfilePress={openProfilePanel}
            onPrintPress={() => setPrintModalVisible(true)}
            notifPanelW={panelW}
            propertyCount={propertyCount}
            customerCount={customerCount}
          />
          <View style={styles.content}>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: bg } }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="results" />
              <Stack.Screen name="list" />
              <Stack.Screen name="property/[id]" />
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            </Stack>
          </View>

          {/* 매물/고객 선택 모달 */}
          <Modal visible={selectModalVisible} transparent animationType="fade" onRequestClose={() => setSelectModalVisible(false)}>
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

          {/* 인쇄 선택 모달 */}
          <Modal visible={printModalVisible} transparent animationType="fade" onRequestClose={() => setPrintModalVisible(false)}>
            <Pressable style={styles.modalBackdrop} onPress={() => setPrintModalVisible(false)}>
              <View style={styles.modalCard}>
                <TouchableOpacity style={styles.modalOptionRow} onPress={() => {
                  setPrintModalVisible(false);
                  printPropertyList(DUMMY_PROPERTIES);
                }}>
                  <Text style={styles.modalOptionTxt}>🏠 전체 매물 인쇄</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalOptionRow, { borderTopWidth: 1, borderTopColor: '#F1F5F9' }]} onPress={() => {
                  setPrintModalVisible(false);
                  printCustomerList(DUMMY_CUSTOMERS);
                }}>
                  <Text style={styles.modalOptionTxt}>👤 전체 고객 인쇄</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Modal>

          {/* 등록 슬라이드 패널 */}
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

          {/* 프로필 슬라이드 패널 */}
          {profileOpen && (
            <>
              <Pressable style={styles.backdrop} onPress={closeProfilePanel} accessibilityRole="button" />
              <Animated.View style={[styles.panel, { width: panelW, transform: [{ translateX: profileSlideX }] }]}>
                <ProfileScreen key={profileKey} embedded />
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
  container:      { flex: 1, backgroundColor: bg },
  content:        { flex: 1 },
  backdrop:       { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.45)', zIndex: 20 },
  panel:          { position: 'absolute', right: 0, top: 0, bottom: 0, backgroundColor: '#FFFFFF', zIndex: 21, borderLeftWidth: 1, borderLeftColor: '#E2E8F0', ...makeShadow(0, 12, 0.12, 12) },
  modalBackdrop:  { flex: 1, justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 56, paddingRight: 16 },
  modalCard:      { backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 4, borderWidth: 1, borderColor: '#E2E8F0', minWidth: 160, ...makeShadow(4, 12, 0.12, 8) },
  modalOptionRow: { paddingVertical: 14, paddingHorizontal: 20 },
  modalOptionTxt: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
});