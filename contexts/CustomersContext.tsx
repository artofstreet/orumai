import React, { createContext, useContext } from 'react';
import { useCustomers, UseCustomersReturn } from '@/hooks/useCustomers';

// 고객 데이터를 앱 전체에서 공유하는 Context
const CustomersContext = createContext<UseCustomersReturn | null>(null);

// Provider — _layout.tsx에서 앱 전체를 감쌀 컴포넌트
export function CustomersProvider({ children }: { children: React.ReactNode }) {
  const value = useCustomers();
  return (
    <CustomersContext.Provider value={value}>
      {children}
    </CustomersContext.Provider>
  );
}

// 각 화면에서 useCustomers() 대신 이걸 import
export function useCustomersContext(): UseCustomersReturn {
  const ctx = useContext(CustomersContext);
  if (!ctx) {
    throw new Error('useCustomersContext는 CustomersProvider 안에서만 사용 가능');
  }
  return ctx;
}

