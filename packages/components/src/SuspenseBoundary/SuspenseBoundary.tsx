import { Suspense } from 'react';
import type { SuspenseBoundaryProps } from './types';
import { ErrorBoundaryImpl } from './ErrorBoundaryImpl';

/**
 * Suspense + ErrorBoundary 통합 컴포넌트
 *
 * 비동기 작업의 3가지 상태를 선언적으로 처리:
 * - Pending (로딩) → pendingFallback
 * - Rejected (에러) → errorFallback
 * - Fulfilled (성공) → children
 *
 * @example
 * ```tsx
 * <SuspenseBoundary
 *   pendingFallback={<Spinner />}
 *   errorFallback={(error, reset) => (
 *     <ErrorMessage error={error} onRetry={reset} />
 *   )}
 * >
 *   <UserProfile userId={id} />
 * </SuspenseBoundary>
 * ```
 */
export function SuspenseBoundary({
  children,
  pendingFallback,
  errorFallback,
  onError,
  onReset,
  resetKeys,
}: SuspenseBoundaryProps) {
  return (
    <ErrorBoundaryImpl
      fallback={errorFallback}
      onError={onError}
      onReset={onReset}
      resetKeys={resetKeys}
    >
      <Suspense fallback={pendingFallback}>{children}</Suspense>
    </ErrorBoundaryImpl>
  );
}
