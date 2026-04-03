import { useCallback, useState } from 'react';

import type { Property } from '@/types';

import { DUMMY_PROPERTIES } from '@/constants/dummyData';

// TODO-DB: DUMMY_PROPERTIES 대신 supabase.from('properties').select() 로 교체 예정
// TODO-DB: addProperty의 id를 Supabase insert 반환값으로 교체 예정
// TODO-RLS: properties 테이블에 auth.uid() = user_id 정책 적용 필요

// 매물 추가 입력 타입(생성 id/생성일은 훅에서 생성)
export type AddPropertyInput = Omit<Property, 'id' | 'createdAt'>;

// 매물 수정 입력 타입(일부 필드만 수정 가능)
export type UpdatePropertyInput = Partial<Omit<Property, 'id' | 'createdAt'>>;

// useProperties 반환 타입
export interface UsePropertiesReturn {
  // 매물 전체 목록(화면에서 사용)
  properties: Property[];
  // 매물 추가
  addProperty: (input: AddPropertyInput) => void;
  // 매물 수정
  updateProperty: (id: string, updates: UpdatePropertyInput) => void;
  // 매물 삭제
  deleteProperty: (id: string) => void;
  // id로 매물 단건 조회
  getPropertyById: (id: string) => Property | undefined;
}

export function useProperties(): UsePropertiesReturn {
  // 매물 상태(초기값은 더미 데이터)
  const [properties, setProperties] = useState<Property[]>(() => [...DUMMY_PROPERTIES]);

  // 매물 추가(로컬 상태 업데이트)
  const addProperty = useCallback((input: AddPropertyInput) => {
    // TODO-DB: addProperty의 id를 Supabase insert 반환값으로 교체 예정
    const generatedId = `prop_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const createdAt = new Date().toISOString();

    const newProperty: Property = {
      ...input,
      id: generatedId,
      createdAt,
    };

    setProperties((prev) => [newProperty, ...prev]);
  }, []);

  // 매물 수정(로컬 상태 업데이트)
  const updateProperty = useCallback((id: string, updates: UpdatePropertyInput) => {
    setProperties((prev) => prev.map((property) => (property.id === id ? { ...property, ...updates } : property)));
  }, []);

  // 매물 삭제(로컬 상태 업데이트)
  const deleteProperty = useCallback((id: string) => {
    setProperties((prev) => prev.filter((property) => property.id !== id));
  }, []);

  // id로 매물 단건 조회(현재 상태 기준)
  const getPropertyById = useCallback(
    (id: string) => {
      return properties.find((property) => property.id === id);
    },
    [properties],
  );

  return {
    properties,
    addProperty,
    updateProperty,
    deleteProperty,
    getPropertyById,
  };
}

