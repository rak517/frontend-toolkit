import { createContext, useContext } from 'react';
import type { QueryParamsAdapter } from './adapters';

/**
 * QueryParams 어댑터를 공유하기 위한 Context
 *
 * QueryParamsProvider와 함께 사용하여 하위 컴포넌트에서
 * 어댑터를 명시적으로 전달하지 않아도 되도록 합니다.
 */
export const QueryParamsContext = createContext<QueryParamsAdapter | null>(
  null
);

/**
 * Context에서 QueryParams 어댑터를 가져오는 훅
 *
 * @returns Provider에서 제공한 어댑터 또는 null
 *
 * @internal 내부 사용 전용
 */
export function useQueryParamsContext(): QueryParamsAdapter | null {
  return useContext(QueryParamsContext);
}
