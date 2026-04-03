import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import CustomerCard from '@/components/CustomerCard';
import PropertyCard from '@/components/PropertyCard';
import SearchBar from '@/components/SearchBar';
import type { Customer, Property } from '@/types';

import { bg, border, primary, text2 } from '@/constants/colors';
import {
  getContentMaxWidth,
  getGridColumns,
  getHorizontalPadding,
} from '@/constants/theme';
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

  const columns = useMemo(() => getGridColumns(windowWidth), [windowWidth]);
  const layoutPadding = useMemo(() => getHorizontalPadding(windowWidth), [windowWidth]);
  const containerWidth = useMemo(() => getContentMaxWidth(windowWidth), [windowWidth]);
  const cardWidth = useMemo(() => {
    const usable = containerWidth - layoutPadding * 2 - GAP * (columns - 1);
    return Math.max(0, Math.floor(usable / columns));
  }, [containerWidth, columns, layoutPadding]);

  const 검색제출무시 = useCallback(() => {}, []);

  const renderPropertyItem = useCallback(
    ({ item }: { item: Property }) => {
      // TODO-ROUTE: /property/[id] 라우트 추가 후 타입 안전하게 제거 예정
      const onPress = () => router.push(`/property/${item.id}` as unknown as Parameters<typeof router.push>[0]);
      return <PropertyCard property={item} width={cardWidth} onPress={onPress} />; // 카드 너비 전달
    },
    [cardWidth],
  );

  const renderCustomerItem = useCallback(
    ({ item }: { item: Customer }) => {
      return <CustomerCard item={item} width={cardWidth} />; // 카드 너비 전달
    },
    [cardWidth],
  );

  const emptyText = '검색 결과가 없어요';
  // 결과 요약 문구(숫자만 강조)
  const 매물건수 = tabCountProperties; // 매물 건수
  const 고객건수 = tabCountCustomers; // 고객 건수

  return (
    <View style={styles.page}>
      <View style={[styles.header, { paddingHorizontal: layoutPadding, maxWidth: containerWidth }]}>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} onSubmit={검색제출무시} />

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
          key={`col-${columns}`} // 열 수 변경 시 재렌더링
          numColumns={columns} // 반응형 그리드 열 수
          columnWrapperStyle={columns > 1 ? styles.gridRow : undefined}
          contentContainerStyle={[styles.listContent, { paddingHorizontal: layoutPadding, maxWidth: containerWidth }]}
          ListEmptyComponent={<Text style={styles.emptyText}>{emptyText}</Text>}
        />
      ) : (
        <FlatList
          data={filteredCustomers}
          keyExtractor={(item) => item.id}
          renderItem={renderCustomerItem}
          key={`cust-col-${columns}`} // 열 수 변경 시 재렌더링
          numColumns={columns} // 반응형 그리드 열 수
          columnWrapperStyle={columns > 1 ? styles.gridRow : undefined}
          contentContainerStyle={[styles.listContent, { paddingHorizontal: layoutPadding, maxWidth: containerWidth }]}
          ListEmptyComponent={<Text style={styles.emptyText}>{emptyText}</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: bg,
    paddingTop: 16,
    gap: 12,
  },
  header: {
    gap: 12,
    alignSelf: 'center',
    width: '100%',
  },
  summaryText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '400',
  }, // 검색결과 요약 텍스트
  summaryCount: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '700',
  }, // 요약 숫자 강조
  tabRow: {
    flexDirection: 'row',
    gap: 18,
    borderBottomWidth: 1,
    borderBottomColor: border,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: primary,
  },
  tabText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  listContent: {
    alignSelf: 'center',
    width: '100%',
    paddingVertical: 16,
    paddingBottom: 24,
    gap: 8,
  },
  gridRow: {
    gap: 8,
  }, // 2열 그리드 row 간격
  emptyText: {
    paddingTop: 24,
    textAlign: 'center',
    color: text2,
    fontSize: 14,
    fontWeight: '700',
  },
});

