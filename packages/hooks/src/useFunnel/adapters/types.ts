/**
 * 퍼널 어댑터 인터페이스
 *
 * URL 쿼리 파라미터 관리를 추상화하여 다양한 환경에서 사용 가능하도록 함
 * - browser: Browser History API 사용
 * - memory: 메모리에서만 관리 (URL 없이)
 * - next-app: Next.js App Router
 * - next-pages: Next.js Pages Router
 * - react-router: React Router
 */
export interface FunnelAdapter {
  /**
   * 현재 URL 쿼리 파라미터 가져오기
   */
  getSearchParams: () => URLSearchParams;

  /**
   * SSR용 스냅샷 가져오기
   * useSyncExternalStore의 getServerSnapshot으로 사용
   */
  getServerSnapshot: () => URLSearchParams;

  /**
   * URL 업데이트 (히스토리에 추가)
   */
  push: (params: URLSearchParams) => void | Promise<void>;

  /**
   * URL 업데이트 (히스토리 교체)
   */
  replace: (params: URLSearchParams) => void | Promise<void>;

  /**
   * 상태 변경 구독
   * @returns 구독 해제 함수
   */
  subscribe: (listener: () => void) => () => void;

  /**
   * 어댑터 초기화 (이벤트 리스너 등록 등)
   * useEffect 내부에서 호출됨
   */
  init?: () => void;

  /**
   * 어댑터 정리 (이벤트 리스너 해제 등)
   */
  cleanup?: () => void;
}

/**
 * Browser 어댑터 옵션
 */
export interface BrowserAdapterOptions {
  /**
   * URL 변경 시 스크롤 위치 초기화 여부
   * @default false
   */
  scroll?: boolean;
}

/**
 * Memory 어댑터 옵션
 */
export interface MemoryAdapterOptions {
  /**
   * 히스토리 최대 크기 (기본값: 50)
   */
  maxHistorySize?: number;
}
