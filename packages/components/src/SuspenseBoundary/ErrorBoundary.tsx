import type { ErrorBoundaryProps } from './types';
import { ErrorBoundaryImpl } from './ErrorBoundaryImpl';

/**
 * ErrorBoundary 단독 컴포넌트
 *
 * Suspense 없이 에러 처리만 필요할 때 사용합니다.
 * 자식 컴포넌트의 렌더링 에러를 잡아서 fallback UI를 표시합니다.
 *
 * @example
 * 기본 사용
 * ```tsx
 * <ErrorBoundary fallback={<ErrorMessage />}>
 *   <UserProfile />
 * </ErrorBoundary>
 * ```
 *
 * @example
 * 함수형 fallback (에러 정보 + 재시도)
 * ```tsx
 * <ErrorBoundary
 *   fallback={(error, reset) => (
 *     <div>
 *       <p>{error.message}</p>
 *       <button onClick={reset}>재시도</button>
 *     </div>
 *   )}
 * >
 *   <UserProfile />
 * </ErrorBoundary>
 * ```
 *
 * @example
 * resetKeys로 자동 리셋
 * ```tsx
 * <ErrorBoundary
 *   fallback={<ErrorMessage />}
 *   resetKeys={[userId]} // userId 변경 시 자동 리셋
 * >
 *   <UserProfile userId={userId} />
 * </ErrorBoundary>
 * ```
 */
export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <ErrorBoundaryImpl {...props} />;
}
