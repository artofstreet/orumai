import { useCallback, useEffect, useState } from 'react';

import type { Property } from '@/types';

import { supabase } from '@/utils/supabase';

// TODO-RLS: properties 테이블에 auth.uid() = user_id 정책 적용 필요

// 매물 추가 입력 타입(Supabase insert 시 id·created_at은 DB 또는 반환값으로 확정)
export type AddPropertyInput = Omit<Property, 'id' | 'createdAt'>;
// 매물 수정 입력 타입(일부 필드만 수정 가능)
export type UpdatePropertyInput = Partial<Omit<Property, 'id' | 'createdAt'>>;

/** Supabase `properties` 테이블 행(스네이크 케이스 컬럼 가정) */
interface PropertyRow {
  id: string; type: string; name: string; building_name: string | null; addr: string; deal: string; price: string;
  sale_price: number | null; jeonse_price: number | null; deposit: number | null; monthly: number | null;
  area: string; area_m2: number | null; floor: string; floor_number: number | null; dir: string | null;
  move_in_date: string | null; total_floors: number | null; built_year: number | null;
  parking: string | null; heating: string | null; status: string; phone: string; memo: string;
  photos: string[] | null; created_at: string;
}

type PropertyInsert = Omit<PropertyRow, 'id' | 'created_at'>;

function rowToProperty(row: PropertyRow): Property {
  return {
    id: row.id,
    type: row.type as Property['type'],
    name: row.name,
    buildingName: row.building_name ?? undefined,
    addr: row.addr,
    deal: row.deal as Property['deal'],
    price: row.price,
    salePrice: row.sale_price ?? undefined,
    jeonsePrice: row.jeonse_price ?? undefined,
    deposit: row.deposit ?? undefined,
    monthly: row.monthly ?? undefined,
    area: row.area,
    areaM2: row.area_m2 ?? undefined,
    floor: row.floor,
    floorNumber: row.floor_number ?? undefined,
    dir: row.dir ?? undefined,
    moveInDate: row.move_in_date ?? undefined,
    totalFloors: row.total_floors ?? undefined,
    builtYear: row.built_year ?? undefined,
    parking: row.parking ?? undefined,
    heating: row.heating ?? undefined,
    status: row.status as Property['status'],
    phone: row.phone,
    memo: row.memo,
    photos: row.photos ?? undefined,
    createdAt: row.created_at,
  };
}

function addInputToInsertRow(input: AddPropertyInput): PropertyInsert {
  return {
    type: input.type,
    name: input.name,
    building_name: input.buildingName ?? null,
    addr: input.addr,
    deal: input.deal,
    price: input.price,
    sale_price: input.salePrice ?? null,
    jeonse_price: input.jeonsePrice ?? null,
    deposit: input.deposit ?? null,
    monthly: input.monthly ?? null,
    area: input.area,
    area_m2: input.areaM2 ?? null,
    floor: input.floor,
    floor_number: input.floorNumber ?? null,
    dir: input.dir ?? null,
    move_in_date: input.moveInDate ?? null,
    total_floors: input.totalFloors ?? null,
    built_year: input.builtYear ?? null,
    parking: input.parking ?? null,
    heating: input.heating ?? null,
    status: input.status,
    phone: input.phone,
    memo: input.memo,
    photos: input.photos ?? null,
  };
}

function updatesToRowPatch(updates: UpdatePropertyInput): Partial<PropertyRow> {
  const patch: Partial<PropertyRow> = {};
  if (updates.type !== undefined) patch.type = updates.type;
  if (updates.name !== undefined) patch.name = updates.name;
  if (updates.buildingName !== undefined) patch.building_name = updates.buildingName ?? null;
  if (updates.addr !== undefined) patch.addr = updates.addr;
  if (updates.deal !== undefined) patch.deal = updates.deal;
  if (updates.price !== undefined) patch.price = updates.price;
  if (updates.salePrice !== undefined) patch.sale_price = updates.salePrice ?? null;
  if (updates.jeonsePrice !== undefined) patch.jeonse_price = updates.jeonsePrice ?? null;
  if (updates.deposit !== undefined) patch.deposit = updates.deposit ?? null;
  if (updates.monthly !== undefined) patch.monthly = updates.monthly ?? null;
  if (updates.area !== undefined) patch.area = updates.area;
  if (updates.areaM2 !== undefined) patch.area_m2 = updates.areaM2 ?? null;
  if (updates.floor !== undefined) patch.floor = updates.floor;
  if (updates.floorNumber !== undefined) patch.floor_number = updates.floorNumber ?? null;
  if (updates.dir !== undefined) patch.dir = updates.dir ?? null;
  if (updates.moveInDate !== undefined) patch.move_in_date = updates.moveInDate ?? null;
  if (updates.totalFloors !== undefined) patch.total_floors = updates.totalFloors ?? null;
  if (updates.builtYear !== undefined) patch.built_year = updates.builtYear ?? null;
  if (updates.parking !== undefined) patch.parking = updates.parking ?? null;
  if (updates.heating !== undefined) patch.heating = updates.heating ?? null;
  if (updates.status !== undefined) patch.status = updates.status;
  if (updates.phone !== undefined) patch.phone = updates.phone;
  if (updates.memo !== undefined) patch.memo = updates.memo;
  if (updates.photos !== undefined) patch.photos = updates.photos ?? null;
  return patch;
}

// useProperties 반환 타입
export interface UsePropertiesReturn {
  properties: Property[];
  loading: boolean;
  error: string | null;
  addProperty: (input: AddPropertyInput) => Promise<void>;
  updateProperty: (id: string, updates: UpdatePropertyInput) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  getPropertyById: (id: string) => Property | undefined;
}

export function useProperties(): UsePropertiesReturn {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 마운트 시 목록 조회
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
      if (cancelled) return;
      setLoading(false);
      if (fetchError) {
        setError(fetchError.message);
        return;
      }
      const rows = (data ?? []) as PropertyRow[];
      setProperties(rows.map(rowToProperty));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const addProperty = useCallback(async (input: AddPropertyInput) => {
    setLoading(true);
    setError(null);
    const { data, error: insertError } = await supabase
      .from('properties')
      .insert(addInputToInsertRow(input))
      .select()
      .single();
    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    if (data) {
      setProperties((prev) => [rowToProperty(data as PropertyRow), ...prev]);
    }
  }, []);

  const updateProperty = useCallback(async (id: string, updates: UpdatePropertyInput) => {
    const patch = updatesToRowPatch(updates);
    if (Object.keys(patch).length === 0) return;
    setLoading(true);
    setError(null);
    const { data, error: updateError } = await supabase.from('properties').update(patch).eq('id', id).select().single();
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    if (data) {
      const next = rowToProperty(data as PropertyRow);
      setProperties((prev) => prev.map((p) => (p.id === id ? next : p)));
    }
  }, []);

  const deleteProperty = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    const { error: deleteError } = await supabase.from('properties').delete().eq('id', id);
    setLoading(false);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setProperties((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const getPropertyById = useCallback(
    (id: string) => properties.find((property) => property.id === id),
    [properties],
  );

  return {
    properties,
    loading,
    error,
    addProperty,
    updateProperty,
    deleteProperty,
    getPropertyById,
  };
}
