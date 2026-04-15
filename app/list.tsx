import CustomerCard from '@/components/CustomerCard';
import PropertyCard from '@/components/PropertyCard';
import { bg, border, primary, text2 } from '@/constants/colors';
import { getContentMaxWidth, getGridColumns, getHorizontalPadding } from '@/constants/theme';
import { useProperties } from '@/hooks/useProperties';
import { useSearch } from '@/hooks/useSearch';
import type { Customer, Property } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
// TODO-DB: Supabase 연결 후 실데이터로 교체 예정
type TabKey = 'properties' | 'customers';
const GAP = 8;
const PAGE_SIZE = 30;

export default function ListScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const params = useLocalSearchParams<{ type?: string }>();

  const initialTab: TabKey = params.type === 'customers' ? 'customers' : 'properties';
  const [tab, setTab] = useState<TabKey>(initialTab);
  const [page, setPage] = useState<number>(1);
  const flatListRef = useRef<{ scrollToOffset: (p: { offset: number; animated: boolean }) => void } | null>(null);

  const { properties } = useProperties();
  const { filteredProperties: rawProperties, filteredCustomers: rawCustomers } = useSearch({ properties });

  const allProperties = useMemo(() => [...rawProperties].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [rawProperties]);
  const allCustomers = useMemo(() => [...rawCustomers].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [rawCustomers]);
  useEffect(() => { setTab(params.type === 'customers' ? 'customers' : 'properties'); setPage(1); flatListRef.current?.scrollToOffset({ offset: 0, animated: true }); }, [params.type]);
  const handleTabChange = useCallback((newTab: TabKey) => { setTab(newTab); setPage(1); flatListRef.current?.scrollToOffset({ offset: 0, animated: true }); }, []);
  const totalPages = Math.max(1, Math.ceil(((tab === 'properties' ? allProperties.length : allCustomers.length) / PAGE_SIZE)));
  const pagedProperties = useMemo(() => allProperties.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [allProperties, page]);
  const pagedCustomers = useMemo(() => allCustomers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [allCustomers, page]);

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
  const listContentStyle = useMemo(() => [styles.listContent, { paddingHorizontal: layoutPadding, maxWidth: layoutWidth }], [layoutPadding, layoutWidth]);
  const renderPropertyItem = useCallback(({ item }: { item: Property }) => <PropertyCard property={item} width={cardWidth} onPress={() => router.push({ pathname: '/property/[id]', params: { id: item.id } })} />, [cardWidth]);
  const renderCustomerItem = useCallback(({ item }: { item: Customer }) => <CustomerCard item={item} width={cardWidth} />, [cardWidth]);
  const goPrevPage = useCallback(() => { setPage((p) => Math.max(1, p - 1)); flatListRef.current?.scrollToOffset({ offset: 0, animated: true }); }, []);
  const goNextPage = useCallback(() => { setPage((p) => Math.min(totalPages, p + 1)); flatListRef.current?.scrollToOffset({ offset: 0, animated: true }); }, [totalPages]);

  return (
    <View style={styles.page}>
      <View style={[styles.contentMax, { maxWidth: layoutWidth }]}>

        {/* 헤더 */}
        <View style={[styles.header, { paddingHorizontal: layoutPadding }]}>
          <View style={styles.titleRow}>
            <Pressable style={styles.backButton} onPress={() => router.push('/')}>
              <Ionicons name="arrow-back" size={22} color={primary} />
            </Pressable>
            <Text style={styles.titleText}>
              {tab === 'properties' ? `전체 매물 ${allProperties.length}건` : `전체 고객 ${allCustomers.length}건`}
            </Text>
          </View>
          <View style={styles.tabRow}>
            <Pressable
              style={[styles.tabButton, tab === 'properties' && styles.tabButtonActive]}
              onPress={() => handleTabChange('properties')}>
              <Text style={[styles.tabText, tab === 'properties' && styles.tabTextActive]}>
                매물 {allProperties.length}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tabButton, tab === 'customers' && styles.tabButtonActive]}
              onPress={() => handleTabChange('customers')}>
              <Text style={[styles.tabText, tab === 'customers' && styles.tabTextActive]}>
                고객 {allCustomers.length}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* 매물 목록 */}
        {tab === 'properties' ? (
          <FlatList<Property>
            ref={(ref) => { flatListRef.current = ref; }}
            data={pagedProperties}
            keyExtractor={(item) => item.id}
            renderItem={renderPropertyItem}
            key={`prop-col-${columns}`}
            numColumns={columns}
            columnWrapperStyle={columns > 1 ? styles.gridRow : undefined}
            contentContainerStyle={listContentStyle}
            ListEmptyComponent={<Text style={styles.emptyText}>등록된 매물이 없어요</Text>}
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
            ListEmptyComponent={<Text style={styles.emptyText}>등록된 고객이 없어요</Text>}
            style={styles.listFlex}
          />
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <View style={[styles.pagination, { paddingHorizontal: layoutPadding }]}>
            <Pressable
              style={[styles.pageButton, page === 1 && styles.pageButtonDisabled]}
              onPress={goPrevPage}
              disabled={page === 1}>
              <Text style={[styles.pageButtonText, page === 1 && styles.pageButtonTextDisabled]}>이전</Text>
            </Pressable>
            <Text style={styles.pageInfo}>{page} / {totalPages}</Text>
            <Pressable
              style={[styles.pageButton, page === totalPages && styles.pageButtonDisabled]}
              onPress={goNextPage}
              disabled={page === totalPages}>
              <Text style={[styles.pageButtonText, page === totalPages && styles.pageButtonTextDisabled]}>다음</Text>
            </Pressable>
          </View>
        )}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page:                   { flex: 1, backgroundColor: bg, paddingTop: 16 },
  contentMax:             { flex: 1, width: '100%', alignSelf: 'center', overflow: 'hidden' },
  header:                 { gap: 12, alignSelf: 'center', width: '100%', marginBottom: 4 },
  // 헤더(뒤로가기/제목/인쇄)를 좌우로 벌려 정렬
  titleRow:               { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  backButton:             { paddingVertical: 4, paddingHorizontal: 2 },
  titleText:              { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  tabRow:                 { flexDirection: 'row', gap: 18, borderBottomWidth: 1, borderBottomColor: border },
  tabButton:              { paddingVertical: 10, paddingHorizontal: 2, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabButtonActive:        { borderBottomColor: primary },
  tabText:                { color: '#94A3B8', fontSize: 14, fontWeight: '500' },
  tabTextActive:          { color: '#1D4ED8', fontWeight: '700' },
  listFlex:               { flex: 1 },
  listContent:            { alignSelf: 'center', width: '100%', paddingVertical: 16, paddingBottom: 8, gap: 8 },
  gridRow:                { gap: 8 },
  emptyText:              { paddingTop: 24, textAlign: 'center', color: text2, fontSize: 14, fontWeight: '700' },
  pagination:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, paddingVertical: 16 },
  pageButton:             { backgroundColor: primary, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 8 },
  pageButtonDisabled:     { backgroundColor: '#E2E8F0' },
  pageButtonText:         { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  pageButtonTextDisabled: { color: '#94A3B8' },
  pageInfo:               { fontSize: 14, fontWeight: '600', color: '#475569', minWidth: 60, textAlign: 'center' },
});