import { useSearchParams } from 'react-router-dom';
import type { QueryParamsAdapter } from './types';

/**
 * React Router v6+ 어댑터 옵션
 */
export interface ReactRouterAdapterOptions {
  /**
   * URL 변경 시 스크롤 위치 유지 여부
   * @default false
   */
  preventScrollReset?: boolean;
}

/**
 * React Router v6+ 어댑터 훅
 *
 * `react-router-dom`의 `useSearchParams`를 사용하여 URL 쿼리 파라미터를 관리합니다.
 * React Router v7에서도 동일하게 동작합니다.
 *
 * @param options - 어댑터 옵션
 * @returns QueryParamsAdapter 인터페이스 구현체
 *
 * @example
 * ```tsx
 * // Provider 방식 (권장)
 * function Providers({ children }: { children: ReactNode }) {
 *   const adapter = useReactRouterAdapter();
 *   return (
 *     <QueryParamsProvider adapter={adapter}>
 *       {children}
 *     </QueryParamsProvider>
 *   );
 * }
 * ```
 */
export function useReactRouterAdapter(
  options: ReactRouterAdapterOptions = {}
): QueryParamsAdapter {
  const { preventScrollReset = false } = options;

  const [searchParams, setSearchParams] = useSearchParams();

  return {
    getSearchParams: () => searchParams,
    getServerSnapshot: () => searchParams,
    push: (params: URLSearchParams) => {
      setSearchParams(params, { preventScrollReset });
    },
    replace: (params: URLSearchParams) => {
      setSearchParams(params, { replace: true, preventScrollReset });
    },
    subscribe: () => () => {},
  };
}
