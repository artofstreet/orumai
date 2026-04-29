import { useCallback, useEffect, useState } from 'react';

import type { Customer } from '@/types';

import { supabase } from '@/utils/supabase';

// TODO-RLS: customers 테이블에 auth.uid() = user_id 정책 적용 필요

// 고객 추가 입력 타입(Supabase insert 시 id·created_at은 DB 또는 반환값으로 확정)
export type AddCustomerInput = Omit<Customer, 'id' | 'createdAt'>;
// 고객 수정 입력 타입(일부 필드만 수정 가능)
export type UpdateCustomerInput = Partial<Omit<Customer, 'id' | 'createdAt'>>;

/** Supabase `customers` 테이블 행(스네이크 케이스 컬럼 가정) */
interface CustomerRow {
  id: string;
  name: string;
  phone: string;
  memo: string;
  created_at: string;
}

type CustomerInsert = Omit<CustomerRow, 'id' | 'created_at'>;

function rowToCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    memo: row.memo,
    createdAt: row.created_at,
  };
}

function addInputToInsertRow(input: AddCustomerInput): CustomerInsert {
  return {
    name: input.name,
    phone: input.phone,
    memo: input.memo,
  };
}

function updatesToRowPatch(updates: UpdateCustomerInput): Partial<CustomerRow> {
  const patch: Partial<CustomerRow> = {};
  if (updates.name !== undefined) patch.name = updates.name;
  if (updates.phone !== undefined) patch.phone = updates.phone;
  if (updates.memo !== undefined) patch.memo = updates.memo;
  return patch;
}

// useCustomers 반환 타입
export interface UseCustomersReturn {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  addCustomer: (input: AddCustomerInput) => Promise<string | null>;
  updateCustomer: (id: string, updates: UpdateCustomerInput) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  getCustomerById: (id: string) => Customer | undefined;
}

export function useCustomers(): UseCustomersReturn {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 마운트 시 목록 조회
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .neq('status', 'deleted')
        .order('created_at', { ascending: false });
      if (cancelled) return;
      setLoading(false);
      if (fetchError) {
        setError(fetchError.message);
        return;
      }
      const rows = (data ?? []) as CustomerRow[];
      setCustomers(rows.map(rowToCustomer));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const addCustomer = useCallback(async (input: AddCustomerInput): Promise<string | null> => {
    setLoading(true);
    setError(null);
    const { data, error: insertError } = await supabase
      .from('customers')
      .insert(addInputToInsertRow(input))
      .select()
      .single();
    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return null;
    }
    if (data) {
      setCustomers((prev) => [rowToCustomer(data as CustomerRow), ...prev]);
      return String((data as CustomerRow).id);
    }
    return null;
  }, []);

  const updateCustomer = useCallback(async (id: string, updates: UpdateCustomerInput) => {
    const patch = updatesToRowPatch(updates);
    if (Object.keys(patch).length === 0) return;
    setLoading(true);
    setError(null);
    const { data, error: updateError } = await supabase.from('customers').update(patch).eq('id', id).select().single();
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    if (data) {
      const next = rowToCustomer(data as CustomerRow);
      setCustomers((prev) => prev.map((c) => (c.id === id ? next : c)));
    }
  }, []);

  const deleteCustomer = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    const { error: deleteError } = await supabase.from('customers').update({ status: 'deleted' }).eq('id', id);
    setLoading(false);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const getCustomerById = useCallback(
    (id: string) => customers.find((customer) => customer.id === id),
    [customers],
  );

  return {
    customers,
    loading,
    error,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById,
  };
}
