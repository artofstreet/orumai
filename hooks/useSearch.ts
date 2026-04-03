import { useCallback, useMemo, useState } from 'react';

import type { Customer, Property } from '@/types';

import { DUMMY_CUSTOMERS, DUMMY_PROPERTIES } from '@/constants/dummyData';

// TODO-DB: 검색 데이터 소스를 DUMMY_PROPERTIES/DUMMY_CUSTOMERS 대신 store(useProperties 결과)로 교체 예정
// TODO-DB: Supabase 스키마 변경 시 검색 범위도 함께 보완 예정

const 검색단어분리 = (query: string): string[] => {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);
};

const 모든단어포함여부 = (targetLower: string, words: string[]): boolean => {
  return words.every((word) => targetLower.includes(word));
};

// 매물 검색에 포함할 텍스트 조각(상수)
const PROPERTY_SEARCH_PARTS: Array<(p: Property) => string> = [
  (p) => p.name,
  (p) => p.type,
  (p) => p.addr,
  (p) => p.deal,
  (p) => p.price,
  (p) => p.memo,
];

// 고객 검색에 포함할 텍스트 조각(상수)
const CUSTOMER_SEARCH_PARTS: Array<(c: Customer) => string> = [
  (c) => c.name,
  (c) => c.phone,
  (c) => c.memo,
];

export interface UseSearchReturn {
  // 현재 검색어
  searchQuery: string;
  // 검색어 변경 함수
  setSearchQuery: (query: string) => void;
  // 검색어로 필터링된 매물 목록
  filteredProperties: Property[];
  // 검색어로 필터링된 고객 목록
  filteredCustomers: Customer[];
}

type UseSearchOptions = {
  // 필터링 대상 매물 목록(미지정 시 더미 사용)
  properties?: Property[];
  // 필터링 대상 고객 목록(미지정 시 더미 사용)
  customers?: Customer[];
};

export function useSearch(options?: UseSearchOptions): UseSearchReturn {
  const [searchQuery, setSearchQueryState] = useState<string>('');

  const properties = options?.properties ?? DUMMY_PROPERTIES;
  const customers = options?.customers ?? DUMMY_CUSTOMERS;

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
  }, []);

  const words = useMemo<string[]>(() => 검색단어분리(searchQuery), [searchQuery]);

  const filteredProperties = useMemo<Property[]>(() => {
    if (words.length === 0) return properties;

    return properties.filter((p) => {
      const searchable = PROPERTY_SEARCH_PARTS.map((pick) => pick(p)).join(' ').toLowerCase();
      return 모든단어포함여부(searchable, words);
    });
  }, [properties, words]);

  const filteredCustomers = useMemo<Customer[]>(() => {
    if (words.length === 0) return customers;

    return customers.filter((c) => {
      const searchable = CUSTOMER_SEARCH_PARTS.map((pick) => pick(c)).join(' ').toLowerCase();
      return 모든단어포함여부(searchable, words);
    });
  }, [customers, words]);

  return {
    searchQuery,
    setSearchQuery,
    filteredProperties,
    filteredCustomers,
  };
}

