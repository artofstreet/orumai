import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import CustomerCard from '@/components/CustomerCard';
import PropertyCard from '@/components/PropertyCard';
import SearchBar from '@/components/SearchBar';
import type { Customer, Property } from '@/types';

import { bg, border, primary, text, text2 } from '@/constants/colors';
import { getContentMaxWidth, getGridColumns, getHorizontalPadding } from '@/constants/theme';
import { useProperties } from '@/hooks/useProperties';
import { useSearch } from '@/hooks/useSearch';

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
  const { width: windowWidth } = useWindowDimensions();
  const { properties } = useProperties();
  const { filteredProperties: rawProperties, filteredCustomers: rawCustomers, searchQuery, setSearchQuery } = useSearch({ properties });

  const filteredProperties = useMemo(
    () => [...rawProperties].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [rawProperties],
  );
  const filteredCustomers = useMemo(
    () => [...rawCustomers].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [rawCustomers],
  );

  const params = useLocalSearchParams<{ query?: string }>();
  const initialQuery = useMemo(() => getInitialQuery(params.query), [params.query]);

  const [tab, setTab] = useState<TabKey>('properties');

  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery, setSearchQuery]);

  // 검색 결과가 있는 탭으로 자동 전환 — 현재 탭만 비어 있고 다른 탭에 건수가 있을 때
  useEffect(() => {
    const nProp = filteredProperties.length;
    const nCust = filteredCustomers.length;
    if (tab === 'properties' && nProp === 0 && nCust > 0) {
      setTab('customers');
    } else if (tab === 'customers' && nCust === 0 && nProp > 0) {
      setTab('properties');
    }
  }, [tab, filteredProperties.length, filteredCustomers.length]);

  const tabCountProperties = filteredProperties.length;
  const tabCountCustomers = filteredCustomers.length;

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
      const onPress = () => router.push({ pathname: '/property/[id]', params: { id: item.id } });
      return <PropertyCard property={item} width={cardWidth} onPress={onPress} />;
    },
    [cardWidth],
  );

  const renderCustomerItem = useCallback(
    ({ item }: { item: Customer }) => <CustomerCard item={item} width={cardWidth} />,
    [cardWidth],
  );

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
            매물 <Text style={styles.summaryCount}>{tabCountProperties}</Text>건 · 고객{' '}
            <Text style={styles.summaryCount}>{tabCountCustomers}</Text>건 검색됨
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
          <FlatList<Property>
            data={filteredProperties}
            keyExtractor={(item) => item.id}
            renderItem={renderPropertyItem}
            key={`col-${columns}`}
            numColumns={columns}
            columnWrapperStyle={columns > 1 ? styles.gridRow : undefined}
            contentContainerStyle={listContentStyle}
            ListEmptyComponent={<Text style={styles.emptyText}>검색 결과가 없어요</Text>}
            style={styles.listFlex}
          />
        ) : (
          <FlatList<Customer>
            data={filteredCustomers}
            keyExtractor={(item) => item.id}
            renderItem={renderCustomerItem}
            key={`cust-col-${columns}`}
            numColumns={columns}
            columnWrapperStyle={columns > 1 ? styles.gridRow : undefined}
            contentContainerStyle={listContentStyle}
            ListEmptyComponent={<Text style={styles.emptyText}>검색 결과가 없어요</Text>}
            style={styles.listFlex}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page:           { flex: 1, backgroundColor: bg, paddingTop: 16, gap: 12 },
  contentMax:     { flex: 1, width: '100%', alignSelf: 'center', position: 'relative', overflow: 'hidden' },
  header:         { gap: 12, alignSelf: 'center', width: '100%' },
  listFlex:       { flex: 1 },
  searchRow:      { flexDirection: 'row', alignItems: 'center', width: '100%', maxWidth: 680, alignSelf: 'center', gap: 16 },
  logoLine:       { fontWeight: '800' },
  logoO:          { color: text, fontSize: 20 },
  logoAI:         { color: primary, fontSize: 20 },
  searchBarSlot:  { flex: 1, minWidth: 0 },
  summaryText:    { fontSize: 12, color: '#64748B', fontWeight: '400' },
  summaryCount:   { fontSize: 12, color: '#0F172A', fontWeight: '700' },
  tabRow:         { flexDirection: 'row', gap: 18, borderBottomWidth: 1, borderBottomColor: border },
  tabButton:      { paddingVertical: 10, paddingHorizontal: 2, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabButtonActive:{ borderBottomColor: primary },
  tabText:        { color: '#94A3B8', fontSize: 14, fontWeight: '500' },
  tabTextActive:  { color: '#1D4ED8', fontWeight: '700' },
  listContent:    { alignSelf: 'center', width: '100%', paddingVertical: 16, paddingBottom: 24, gap: 8 },
  gridRow:        { gap: 8 },
  emptyText:      { paddingTop: 24, textAlign: 'center', color: text2, fontSize: 14, fontWeight: '700' },
});