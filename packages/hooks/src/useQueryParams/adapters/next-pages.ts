import { useRouter } from 'next/router';
import type { QueryParamsAdapter } from './types';

/**
 * Next.js Pages Router 어댑터 옵션
 */
export interface NextPagesAdapterOptions {
  /**
   * URL 변경 시 스크롤 위치 초기화 여부
   * @default false
   */
  scroll?: boolean;
  /**
   * Shallow routing 사용 여부 (getServerSideProps 재실행 안 함)
   * @default true
   */
  shallow?: boolean;
}

/**
 * Next.js Pages Router용 어댑터 훅
 *
 * `next/router`의 `useRouter`를 사용하여 URL 쿼리 파라미터를 관리합니다.
 *
 * @param options - 어댑터 옵션
 * @returns QueryParamsAdapter 인터페이스 구현체
 *
 * @example
 * ```tsx
 * // Provider 방식 (권장)
 * function Providers({ children }: { children: ReactNode }) {
 *   const adapter = useNextPagesAdapter();
 *   return (
 *     <QueryParamsProvider adapter={adapter}>
 *       {children}
 *     </QueryParamsProvider>
 *   );
 * }
 * ```
 */
export function useNextPagesAdapter(
  options: NextPagesAdapterOptions = {}
): QueryParamsAdapter {
  const { scroll = false, shallow = true } = options;

  const router = useRouter();

  const getSearchParams = (): URLSearchParams => {
    const queryString = router.asPath.split('?')[1] || '';
    return new URLSearchParams(queryString);
  };

  const buildUrl = (params: URLSearchParams): string => {
    const pathname = router.pathname;
    const search = params.toString();
    return search ? `${pathname}?${search}` : pathname;
  };

  return {
    getSearchParams,
    getServerSnapshot: () => new URLSearchParams(),
    push: (params: URLSearchParams) => {
      void router.push(buildUrl(params), undefined, { scroll, shallow });
    },
    replace: (params: URLSearchParams) => {
      void router.replace(buildUrl(params), undefined, { scroll, shallow });
    },
    subscribe: () => () => {},
  };
}
