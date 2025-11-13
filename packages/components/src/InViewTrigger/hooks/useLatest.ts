import { useRef } from 'react';

/**
 * 항상 최신 값을 참조하는 ref를 반환합니다.
 *
 * useEffect 의존성 배열에서 제외하면서도
 * 최신 값을 사용하고 싶을 때 유용합니다.
 *
 * @param value - 참조할 값
 * @returns 최신 값을 담은 ref
 *
 * @example
 * ```tsx
 * const latestCallback = useLatest(callback);
 *
 * useEffect(() => {
 *   const interval = setInterval(() => {
 *     latestCallback.current(); // 항상 최신 callback 실행
 *   }, 1000);
 *   return () => clearInterval(interval);
 * }, []); // callback을 의존성에서 제외 가능!
 * ```
 */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;

  return ref;
}
