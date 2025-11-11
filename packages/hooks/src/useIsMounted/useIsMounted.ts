import { useEffect, useState } from 'react';

/**
 * 컴포넌트 마운트 여부 확인 Hook
 *
 * SSR 환경에서 클라이언트 전용 로직을 안전하게 실행하기 위해 사용합니다.
 * 서버에서는 false, 클라이언트 마운트 후 true를 반환합니다.
 *
 * @returns 마운트 여부
 *
 * @example
 * ```tsx
 * const isMounted = useIsMounted();
 *
 * useEffect(() => {
 *   if (isMounted) {
 *     // localStorage, window 등 브라우저 API 안전하게 사용
 *   }
 * }, [isMounted]);
 * ```
 */
export function useIsMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
