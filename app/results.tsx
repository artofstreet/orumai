import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
const PAGE_SIZE = 30; // list.tsx와 동일(30건 단위 slice)

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
  const [page, setPage] = useState<number>(1);
  const flatListRef = useRef<{ scrollToOffset: (p: { offset: number; animated: boolean }) => void } | null>(null);

  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery, setSearchQuery]);
  useEffect(() => { // 검색어 변경 시 1페이지로
    setPage(1);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [searchQuery]);
  const handleTabChange = useCallback((newTab: TabKey) => {
    setTab(newTab);
    setPage(1);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);
  useEffect(() => { // 검색 결과 있는 탭으로 자동 전환(한쪽만 비었을 때)
    const nProp = filteredProperties.length;
    const nCust = filteredCustomers.length;
    if (tab === 'properties' && nProp === 0 && nCust > 0) {
      setTab('customers');
      setPage(1);
    } else if (tab === 'customers' && nCust === 0 && nProp > 0) {
      setTab('properties');
      setPage(1);
    }
  }, [tab, filteredProperties.length, filteredCustomers.length]);

  const totalPages = Math.max(1, Math.ceil((tab === 'properties' ? filteredProperties.length : filteredCustomers.length) / PAGE_SIZE));
  useEffect(() => {
    // totalPages 줄어들면 page 범위 보정
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);
  const pagedProperties = useMemo(() => filteredProperties.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filteredProperties, page]);
  const pagedCustomers = useMemo(() => filteredCustomers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filteredCustomers, page]);
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
  const goPrevPage = useCallback(() => { setPage((p) => Math.max(1, p - 1)); flatListRef.current?.scrollToOffset({ offset: 0, animated: true }); }, []);
  const goNextPage = useCallback(() => { setPage((p) => Math.min(totalPages, p + 1)); flatListRef.current?.scrollToOffset({ offset: 0, animated: true }); }, [totalPages]);
  const handleSearchSubmit = useCallback(() => { // 검색어 제출 시 1페이지로 + 맨 위로 스크롤
    setPage(1);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);
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
              <Pressable onPress={() => router.replace('/')}>
                <Text style={styles.logoLine}>
                  <Text style={styles.logoO}>오름</Text>
                  <Text style={styles.logoAI}>AI</Text>
                </Text>
              </Pressable>
            ) : null}
            <View style={styles.searchBarSlot}>
              <SearchBar value={searchQuery} onChangeText={setSearchQuery} onSubmit={handleSearchSubmit} />
            </View>
          </View>
          <Text style={styles.summaryText}>
            매물 <Text style={styles.summaryCount}>{tabCountProperties}</Text>건 · 고객 <Text style={styles.summaryCount}>{tabCountCustomers}</Text>건 검색됨
          </Text>
          <View style={styles.tabRow}>
            <Pressable style={[styles.tabButton, tab === 'properties' && styles.tabButtonActive]} onPress={() => handleTabChange('properties')}>
              <Text style={[styles.tabText, tab === 'properties' && styles.tabTextActive]}>매물</Text>
            </Pressable>
            <Pressable style={[styles.tabButton, tab === 'customers' && styles.tabButtonActive]} onPress={() => handleTabChange('customers')}>
              <Text style={[styles.tabText, tab === 'customers' && styles.tabTextActive]}>고객</Text>
            </Pressable>
          </View>
        </View>
        {tab === 'properties' ? (
          <FlatList<Property>
            ref={(ref) => { flatListRef.current = ref; }}
            data={pagedProperties}
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
            ref={(ref) => { flatListRef.current = ref; }}
            data={pagedCustomers}
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
        {totalPages > 1 && (
          <View style={[styles.pagination, { paddingHorizontal: layoutPadding }]}>
            <Pressable style={[styles.pageButton, page === 1 && styles.pageButtonDisabled]} onPress={goPrevPage} disabled={page === 1}>
              <Text style={[styles.pageButtonText, page === 1 && styles.pageButtonTextDisabled]}>이전</Text>
            </Pressable>
            <Text style={styles.pageInfo}>{page} / {totalPages}</Text>
            <Pressable style={[styles.pageButton, page === totalPages && styles.pageButtonDisabled]} onPress={goNextPage} disabled={page === totalPages}>
              <Text style={[styles.pageButtonText, page === totalPages && styles.pageButtonTextDisabled]}>다음</Text>
            </Pressable>
          </View>
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
  pagination:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, paddingVertical: 16 },
  pageButton:             { backgroundColor: primary, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 8 },
  pageButtonDisabled:     { backgroundColor: '#E2E8F0' },
  pageButtonText:         { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  pageButtonTextDisabled: { color: '#94A3B8' },
  pageInfo:               { fontSize: 14, fontWeight: '600', color: '#475569', minWidth: 60, textAlign: 'center' },
});
