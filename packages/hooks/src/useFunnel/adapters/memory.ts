import type { FunnelAdapter, MemoryAdapterOptions } from './types';

const EMPTY_PARAMS = new URLSearchParams();

const DEFAULT_MAX_HISTORY_SIZE = 50;

/**
 * Memory 어댑터 생성
 *
 * 메모리에만 상태를 저장하는 기본 어댑터
 * URL 동기화나 새로고침 복원이 필요 없는 경우 사용
 *
 * @example
 * ```tsx
 * const funnel = useFunnel(STEPS, {
 *   initialStep: 'step1',
 *   adapter: createMemoryAdapter(),
 * });
 * ```
 */
export function createMemoryAdapter(
  options: MemoryAdapterOptions = {}
): FunnelAdapter {
  const { maxHistorySize = DEFAULT_MAX_HISTORY_SIZE } = options;

  // 히스토리 스택
  const historyStack: URLSearchParams[] = [new URLSearchParams()];
  let currentIndex = 0;

  // 구독자 목록
  const listeners = new Set<() => void>();

  const notify = () => {
    listeners.forEach(listener => listener());
  };

  const getSearchParams = (): URLSearchParams => {
    return historyStack[currentIndex] ?? new URLSearchParams();
  };

  const getServerSnapshot = (): URLSearchParams => {
    return EMPTY_PARAMS;
  };

  const push = (params: URLSearchParams): void => {
    // 현재 위치 이후의 히스토리 제거 (새 분기 시작)
    historyStack.splice(currentIndex + 1);

    // 새 상태 추가
    historyStack.push(new URLSearchParams(params));

    // 최대 크기 초과 시 오래된 항목 제거
    if (historyStack.length > maxHistorySize) {
      historyStack.shift();
    } else {
      currentIndex++;
    }

    notify();
  };

  const replace = (params: URLSearchParams): void => {
    historyStack[currentIndex] = new URLSearchParams(params);
    notify();
  };

  const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  return {
    getSearchParams,
    getServerSnapshot,
    push,
    replace,
    subscribe,
  };
}
