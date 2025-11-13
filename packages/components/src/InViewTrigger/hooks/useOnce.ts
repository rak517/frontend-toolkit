import { useCallback, useRef } from 'react';

/**
 * 한 번만 실행되도록 관리하는 Hook
 *
 * @returns check - 이미 실행되었는지 확인
 * @returns mark - 실행됨으로 표시
 * @returns reset - 초기화
 *
 * @example
 * ```tsx
 * const once = useOnce();
 *
 * function handleClick() {
 *   if (once.check()) {
 *     console.log('이미 실행됨');
 *     return;
 *   }
 *
 *   // 로직 실행
 *   doSomething();
 *   once.mark();
 * }
 * ```
 */
export function useOnce() {
  const hasTriggered = useRef(false);

  const check = useCallback(() => {
    return hasTriggered.current;
  }, []);

  const mark = useCallback(() => {
    hasTriggered.current = true;
  }, []);

  const reset = useCallback(() => {
    hasTriggered.current = false;
  }, []);

  return { check, mark, reset };
}
