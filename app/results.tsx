import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { subscribeRegisterPress } from '@/components/TopBar';
import CustomerCard from '@/components/CustomerCard';
import PropertyCard from '@/components/PropertyCard';
import SearchBar from '@/components/SearchBar';
import type { Customer, Property } from '@/types';

import { bg, border, primary, text, text2 } from '@/constants/colors';
import { getContentMaxWidth, getGridColumns, getHorizontalPadding } from '@/constants/theme';
import { useProperties } from '@/hooks/useProperties';
import { useSearch } from '@/hooks/useSearch';

import PropertyRegisterScreen from './property/register';

// TODO-DB: useProperties, useSearch를 Supabase 연결 후 실데이터로 교체 예정
// TODO-AUTH: 등록 저장 시 로그인 사용자 id 연동
// TODO-STORAGE: 매물 사진 업로드 연동

type TabKey = 'properties' | 'customers';

const GAP = 8; // 카드 사이 간격

const getInitialQuery = (queryParam: unknown): string => {
  if (typeof queryParam === 'string') return queryParam;
  return '';
};

export default function ResultsScreen() {
  const { width: windowWidth } = useWindowDimensions(); // 화면 너비(반응형 컬럼 계산)
  const { properties } = useProperties();
  const { filteredProperties, filteredCustomers, searchQuery, setSearchQuery } = useSearch({ properties });

  const params = useLocalSearchParams<{ query?: string; openRegister?: string | string[] }>();
  const initialQuery = useMemo(() => getInitialQuery(params.query), [params.query]);
  const openRegisterParam = useMemo(() => {
    const v = params.openRegister;
    if (Array.isArray(v)) return v[0];
    return v;
  }, [params.openRegister]);

  const [tab, setTab] = useState<TabKey>('properties');
  const [registerOpen, setRegisterOpen] = useState<boolean>(false); // 우측 등록 패널 열림
  /** 768px 미만: 전체 너비 덮기 · 이상: 우측 슬라이드 패널 */
  const panelW = useMemo(() => {
    if (windowWidth < 768) return windowWidth;
    return Math.min(480, Math.floor(windowWidth * 0.92));
  }, [windowWidth]);
  const slideX = useRef(new Animated.Value(panelW)).current; // 패널 슬라이드(translateX)
  const consumedOpenRegister = useRef<boolean>(false); // openRegister=1 URL 소비 여부

  useEffect(() => {
    if (!registerOpen) slideX.setValue(panelW);
  }, [panelW, slideX, registerOpen]);

  useEffect(() => {
    return subscribeRegisterPress(() => {
      slideX.setValue(panelW);
      setRegisterOpen(true);
    });
  }, [panelW, slideX]);

  useEffect(() => {
    if (openRegisterParam !== '1') {
      consumedOpenRegister.current = false;
      return;
    }
    if (consumedOpenRegister.current) return;
    consumedOpenRegister.current = true;
    slideX.setValue(panelW);
    setRegisterOpen(true);
  }, [openRegisterParam, panelW, slideX]);

  useEffect(() => {
    if (!registerOpen) return;
    Animated.timing(slideX, {
      toValue: 0,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [registerOpen, slideX]);

  const closeRegisterPanel = useCallback(() => {
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
    setSearchQuery(initialQuery);
  }, [initialQuery, setSearchQuery]);

  const tabCountProperties = filteredProperties.length; // 매물 결과 건수
  const tabCountCustomers = filteredCustomers.length; // 고객 결과 건수

  const isUltraWide = windowWidth >= 1920;
  const columns = useMemo(() => {
    if (isUltraWide) return 3;
    return getGridColumns(windowWidth);
  }, [isUltraWide, windowWidth]);
  const layoutPadding = useMemo(() => getHorizontalPadding(windowWidth), [windowWidth]);
  const layoutWidth = useMemo(() => getContentMaxWidth(windowWidth), [windowWidth]);
  const cardWidth = useMemo(() => {
    const usable = layoutWidth - layoutPadding * 2 - GAP * (columns - 1);
    return Math.max(0, Math.floor(usable / columns));
  }, [layoutWidth, columns, layoutPadding]);

  const listContentStyle = useMemo(
    () => [styles.listContent, { paddingHorizontal: layoutPadding, maxWidth: layoutWidth }],
    [layoutPadding, layoutWidth],
  );

  const 검색제출무시 = useCallback(() => {}, []);

  const renderPropertyItem = useCallback(
    ({ item }: { item: Property }) => {
      // TODO-ROUTE: /property/[id] 라우트 추가 후 타입 안전하게 제거 예정
      const onPress = () => router.push({ pathname: '/property/[id]', params: { id: item.id } });
      return <PropertyCard property={item} width={cardWidth} onPress={onPress} />;
    },
    [cardWidth],
  );

  const renderCustomerItem = useCallback(
    ({ item }: { item: Customer }) => {
      return <CustomerCard item={item} width={cardWidth} />;
    },
    [cardWidth],
  );

  const emptyText = '검색 결과가 없어요';
  const 매물건수 = tabCountProperties;
  const 고객건수 = tabCountCustomers;

  return (
    <View style={styles.page}>
      <View style={[styles.contentMax, { maxWidth: layoutWidth }]}>
        <View style={[styles.header, { paddingHorizontal: layoutPadding, maxWidth: layoutWidth }]}>
        <View style={styles.searchRow}>
          {windowWidth > 600 ? (
            <Pressable onPress={() => router.push('/')}>
              <Text style={styles.logoLine}>
                <Text style={styles.logoO}>오름</Text>
                <Text style={styles.logoAI}>AI</Text>
              </Text>
            </Pressable>
          ) : null}
          <View style={styles.searchBarSlot}>
            <SearchBar value={searchQuery} onChangeText={setSearchQuery} onSubmit={검색제출무시} />
          </View>
        </View>
        <Text style={styles.summaryText}>
          매물 <Text style={styles.summaryCount}>{매물건수}</Text>건 · 고객{' '}
          <Text style={styles.summaryCount}>{고객건수}</Text>건 검색됨
        </Text>

        <View style={styles.tabRow}>
          <Pressable
            style={[styles.tabButton, tab === 'properties' && styles.tabButtonActive]}
            onPress={() => setTab('properties')}>
            <Text style={[styles.tabText, tab === 'properties' && styles.tabTextActive]}>매물</Text>
          </Pressable>
          <Pressable
            style={[styles.tabButton, tab === 'customers' && styles.tabButtonActive]}
            onPress={() => setTab('customers')}>
            <Text style={[styles.tabText, tab === 'customers' && styles.tabTextActive]}>고객</Text>
          </Pressable>
        </View>
      </View>

        {tab === 'properties' ? (
          <FlatList
            data={filteredProperties}
            keyExtractor={(item) => item.id}
            renderItem={renderPropertyItem}
            key={`col-${columns}`}
            numColumns={columns}
            columnWrapperStyle={columns > 1 ? styles.gridRow : undefined}
            contentContainerStyle={listContentStyle}
            ListEmptyComponent={<Text style={styles.emptyText}>{emptyText}</Text>}
            style={styles.listFlex}
          />
        ) : (
          <FlatList
            data={filteredCustomers}
            keyExtractor={(item) => item.id}
            renderItem={renderCustomerItem}
            key={`cust-col-${columns}`}
            numColumns={columns}
            columnWrapperStyle={columns > 1 ? styles.gridRow : undefined}
            contentContainerStyle={listContentStyle}
            ListEmptyComponent={<Text style={styles.emptyText}>{emptyText}</Text>}
            style={styles.listFlex}
          />
        )}

        {registerOpen &&
          (
            <>
              <Pressable style={styles.backdrop} onPress={closeRegisterPanel} accessibilityRole="button" />
              <Animated.View
                style={[
                  styles.registerPanel,
                  { width: panelW, transform: [{ translateX: slideX }] },
                ]}>
                <PropertyRegisterScreen embedded />
              </Animated.View>
            </>
          )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: bg, paddingTop: 16, gap: 12 },
  contentMax: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  header: { gap: 12, alignSelf: 'center', width: '100%' },
  listFlex: { flex: 1 },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    zIndex: 10,
  },
  registerPanel: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 11,
    borderLeftWidth: 1,
    borderLeftColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    gap: 16,
  }, // 로고+검색창 묶음(중앙, SearchBar max 680과 동일)
  logoLine: { fontWeight: '800' }, // 오름AI 래퍼
  logoO: { color: text, fontSize: 20 }, // 오름(본문 네이비)
  logoAI: { color: primary, fontSize: 20 }, // AI(브랜드 파랑)
  searchBarSlot: { flex: 1, minWidth: 0 }, // 검색창이 묶음 안 남은 폭 채움
  summaryText: { fontSize: 12, color: '#64748B', fontWeight: '400' },
  summaryCount: { fontSize: 12, color: '#0F172A', fontWeight: '700' },
  tabRow: { flexDirection: 'row', gap: 18, borderBottomWidth: 1, borderBottomColor: border },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: { borderBottomColor: primary },
  tabText: { color: '#94A3B8', fontSize: 14, fontWeight: '500' },
  tabTextActive: { color: '#1D4ED8', fontWeight: '700' },
  listContent: { alignSelf: 'center', width: '100%', paddingVertical: 16, paddingBottom: 24, gap: 8 },
  gridRow: { gap: 8 },
  emptyText: { paddingTop: 24, textAlign: 'center', color: text2, fontSize: 14, fontWeight: '700' },
});

