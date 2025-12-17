import type { QueryParamsAdapter } from './types';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

/**
 * Next.js App Router 어댑터 옵션
 */
export interface NextAppAdapterOptions {
  /**
   * URL 변경 시 스크롤 위치 초기화 여부
   * @default false
   */
  scroll?: boolean;
}

/**
 * Next.js App Router용 어댑터 훅
 *
 * `next/navigation`의 `useRouter`, `useSearchParams`, `usePathname`을 사용하여
 * URL 쿼리 파라미터를 관리합니다.
 *
 * @param options - 어댑터 옵션
 * @returns QueryParamsAdapter 인터페이스 구현체
 *
 * @example
 * ```tsx
 * // Provider 방식 (권장)
 * function Providers({ children }: { children: ReactNode }) {
 *   const adapter = useNextAppAdapter();
 *   return (
 *     <QueryParamsProvider adapter={adapter}>
 *       {children}
 *     </QueryParamsProvider>
 *   );
 * }
 * ```
 */
export function useNextAppAdapter(
  options: NextAppAdapterOptions = {}
): QueryParamsAdapter {
  const { scroll = false } = options;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const cached = new URLSearchParams(searchParams.toString());

  const buildUrl = (params: URLSearchParams): string => {
    const search = params.toString();
    return search ? `${pathname}?${search}` : pathname;
  };

  return {
    getSearchParams: () => cached,
    getServerSnapshot: () => cached,
    push: (params: URLSearchParams) => {
      router.push(buildUrl(params), { scroll });
    },
    replace: (params: URLSearchParams) => {
      router.replace(buildUrl(params), { scroll });
    },
    subscribe: () => () => {},
  };
}
