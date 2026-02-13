import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnce } from './useOnce';

describe('useOnce', () => {
  it('초기 상태에서 check()가 false를 반환한다', () => {
    const { result } = renderHook(() => useOnce());
    expect(result.current.check()).toBe(false);
  });

  it('mark() 후 check()가 true를 반환한다', () => {
    const { result } = renderHook(() => useOnce());

    act(() => {
      result.current.mark();
    });

    expect(result.current.check()).toBe(true);
  });

  it('reset() 후 check()가 다시 false를 반환한다', () => {
    const { result } = renderHook(() => useOnce());

    act(() => {
      result.current.mark();
    });
    expect(result.current.check()).toBe(true);

    act(() => {
      result.current.reset();
    });
    expect(result.current.check()).toBe(false);
  });

  it('리렌더링 후에도 상태가 유지된다', () => {
    const { result, rerender } = renderHook(() => useOnce());

    act(() => {
      result.current.mark();
    });

    rerender();
    expect(result.current.check()).toBe(true);
  });
});
