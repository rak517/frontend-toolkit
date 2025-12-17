import type { ReactNode } from 'react';
import type { QueryParamsAdapter } from './adapters';
import { QueryParamsContext } from './context';

/**
 * QueryParamsProvider 컴포넌트 Props
 */
export interface QueryParamsProviderProps {
  /**
   * 사용할 어댑터
   */
  adapter: QueryParamsAdapter;
  /**
   * 하위 컴포넌트
   */
  children: ReactNode;
}

/**
 * QueryParams 어댑터를 하위 컴포넌트에 제공하는 Provider
 *
 * 이 Provider를 사용하면 하위 컴포넌트에서 useQueryParams 호출 시
 * adapter 옵션을 생략할 수 있습니다.
 *
 * @example
 * ```tsx
 * // Next.js App Router
 * function Providers({ children }: { children: ReactNode }) {
 *   const adapter = useNextAppAdapter();
 *   return (
 *     <Suspense fallback={null}>
 *       <QueryParamsProvider adapter={adapter}>
 *         {children}
 *       </QueryParamsProvider>
 *     </Suspense>
 *   );
 * }
 *
 * // 하위 컴포넌트에서 adapter 생략 가능
 * function Component() {
 *   const { page } = useQueryParams({ page: parseAsInteger });
 * }
 * ```
 */
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
