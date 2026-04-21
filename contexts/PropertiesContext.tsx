import React, { createContext, useContext } from 'react';
import { useProperties, UsePropertiesReturn } from '@/hooks/useProperties';

// 매물 데이터를 앱 전체에서 공유하는 Context
const PropertiesContext = createContext<UsePropertiesReturn | null>(null);

// Provider — _layout.tsx에서 앱 전체를 감쌀 컴포넌트
export function PropertiesProvider({ children }: { children: React.ReactNode }) {
  const value = useProperties();
  return (
    <PropertiesContext.Provider value={value}>
      {children}
    </PropertiesContext.Provider>
  );
}

// 각 화면에서 useProperties() 대신 이걸 import
export function usePropertiesContext(): UsePropertiesReturn {
  const ctx = useContext(PropertiesContext);
  if (!ctx) {
    throw new Error('usePropertiesContext는 PropertiesProvider 안에서만 사용 가능');
  }
  return ctx;
}

