import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import CustomerCard from '@/components/CustomerCard';
import PropertyCard from '@/components/PropertyCard';
import SearchBar from '@/components/SearchBar';
import type { Customer, Property } from '@/types';

import { bg, border, primary, text, text2 } from '@/constants/colors';
import { getContentMaxWidth, getGridColumns, getHorizontalPadding } from '@/constants/theme';
import { useProperties } from '@/hooks/useProperties';
import { useSearch } from '@/hooks/useSearch';

// TODO-DB: useProperties, useSearch를 Supabase 연결 후 실데이터로 교체 예정

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

  const params = useLocalSearchParams<{ query?: string }>();
  const initialQuery = useMemo(() => getInitialQuery(params.query), [params.query]);

  const [tab, setTab] = useState<TabKey>('properties');

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
      const onPress = () => router.push(`/property/${item.id}` as unknown as Parameters<typeof router.push>[0]);
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
      <View style={[styles.header, { paddingHorizontal: layoutPadding, maxWidth: layoutWidth }]}>
        <View style={styles.searchRow}>
          {windowWidth > 600 ? (
            <Text style={styles.logoLine}>
              <Text style={styles.logoO}>오름</Text>
              <Text style={styles.logoAI}>AI</Text>
            </Text>
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
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: bg, paddingTop: 16, gap: 12 },
  header: { gap: 12, alignSelf: 'center', width: '100%' },
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

