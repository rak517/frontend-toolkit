import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useIsMounted } from './useIsMounted';

describe('useIsMounted', () => {
  it('마운트 후 true를 반환한다', () => {
    const { result } = renderHook(() => useIsMounted());
    expect(result.current).toBe(true);
  });

  it('언마운트 후에도 마지막 상태를 유지한다', () => {
    const { result, unmount } = renderHook(() => useIsMounted());
    expect(result.current).toBe(true);

    unmount();
    // 언마운트 후에도 result.current는 마지막 상태 유지
    expect(result.current).toBe(true);
  });

  it('리렌더링 후에도 true를 유지한다', () => {
    const { result, rerender } = renderHook(() => useIsMounted());
    expect(result.current).toBe(true);

    rerender();
    expect(result.current).toBe(true);

    rerender();
    expect(result.current).toBe(true);
  });
});
