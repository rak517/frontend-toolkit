import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLatest } from './useLatest';

describe('useLatest', () => {
  it('초기값을 ref.current로 반환한다', () => {
    const { result } = renderHook(() => useLatest('초기값'));
    expect(result.current.current).toBe('초기값');
  });

  it('값이 변경되면 ref.current가 최신 값을 반영한다', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useLatest(value),
      { initialProps: { value: 'A' } }
    );

    expect(result.current.current).toBe('A');

    rerender({ value: 'B' });
    expect(result.current.current).toBe('B');

    rerender({ value: 'C' });
    expect(result.current.current).toBe('C');
  });

  it('ref 객체의 참조가 리렌더링 간 유지된다', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useLatest(value),
      { initialProps: { value: 1 } }
    );

    const firstRef = result.current;

    rerender({ value: 2 });
    expect(result.current).toBe(firstRef);
  });
});
