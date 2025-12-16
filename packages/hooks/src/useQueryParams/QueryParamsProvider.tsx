import type { ReactNode } from 'react';
import type { QueryParamsAdapter } from './adapters';
import { QueryParamsContext } from './context';

export interface QueryParamsProviderProps {
  adapter: QueryParamsAdapter;
  children: ReactNode;
}

export function QueryParamsProvider({
  adapter,
  children,
}: QueryParamsProviderProps) {
  return (
    <QueryParamsContext.Provider value={adapter}>
      {children}
    </QueryParamsContext.Provider>
  );
}
