import { useCallback, useEffect, useRef } from 'react';

/**
 * 지연 실행 가능한 콜백을 관리하는 Hook
 *
 * @param callback - 실행할 콜백 함수
 * @param delay - 지연 시간 (ms), 0이면 즉시 실행
 * @returns schedule - 콜백 예약
 * @returns cancel - 예약 취소
 *
 * @example
 * ```tsx
 * const { schedule, cancel } = useDelayedCallback(
 *   (value: string) => console.log(value),
 *   300
 * );
 *
 * // 300ms 후 실행
 * schedule('Hello');
 *
 * // 취소
 * cancel();
 * ```
 */
export function useDelayedCallback<T>(
  callback: (arg: T) => void,
  delay: number
) {
  const callbackRef = useRef(callback);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  callbackRef.current = callback;

  const cancel = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const schedule = useCallback(
    (arg: T) => {
      cancel();

      if (delay > 0) {
        timerRef.current = setTimeout(() => {
          callbackRef.current(arg);
        }, delay);
      } else {
        callbackRef.current(arg);
      }
    },
    [delay, cancel]
  );

  useEffect(() => {
    return () => cancel();
  }, [cancel]);

  return { schedule, cancel };
}
