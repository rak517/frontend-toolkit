import { createContext, useContext } from 'react';
import type { QueryParamsAdapter } from './adapters';

export const QueryParamsContext = createContext<QueryParamsAdapter | null>(
  null
);

export function useQueryParamsContext(): QueryParamsAdapter | null {
  return useContext(QueryParamsContext);
}
