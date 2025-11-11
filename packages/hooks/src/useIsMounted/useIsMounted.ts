import { useEffect, useState } from 'react';

/**
 * 컴포넌트가 마운트되었는지 확인하는 훅
 *
 * SSR 환경에서 클라이언트 전용 로직을 안전하게 실행하기 위해 사용합니다.
 * 서버에서는 항상 false, 클라이언트에서는 마운트 후 true를 반환합니다.
 *
 * @returns 마운트 여부
 *
 * @example
 * ```tsx
 * function Component() {
 *   const isMounted = useIsMounted();
 *
 *   if (!isMounted) {
 *     return <div>Loading...</div>; // SSR 또는 초기 렌더
 *   }
 *
 *   // 클라이언트에서만 실행되는 로직
 *   return <div>{new Date().toLocaleString()}</div>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // localStorage 접근
 * function UserSettings() {
 *   const isMounted = useIsMounted();
 *   const [settings, setSettings] = useState(null);
 *
 *   useEffect(() => {
 *     if (isMounted) {
 *       const saved = localStorage.getItem('settings');
 *       setSettings(JSON.parse(saved));
 *     }
 *   }, [isMounted]);
 *
 *   return <div>...</div>;
 * }
 * ```
 *
 * @performance
 * - Bundle size: ~0.2 KB
 * - Re-render: 초기 마운트 시 1회만 발생
 *
 * @see https://nextjs.org/docs/messages/react-hydration-error
 */
export function useIsMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
