import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('초기값을 즉시 반환한다', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('지정된 delay 후에 값이 업데이트된다', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 500 });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });

  it('delay 내 값 변경 시 이전 타이머가 취소된다', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'first', delay: 500 } }
    );

    rerender({ value: 'second', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    rerender({ value: 'third', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('first');

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe('third');
  });

  it('delay가 변경되면 새로운 타이머가 설정된다', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    rerender({ value: 'updated', delay: 200 });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe('updated');
  });

  it('언마운트 시 타이머가 정리된다', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    const { unmount, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated', delay: 500 });
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it('다양한 타입의 값을 처리할 수 있다', () => {
    const { result: numberResult } = renderHook(() => useDebounce(42, 100));
    expect(numberResult.current).toBe(42);

    const obj = { name: 'test', value: 123 };
    const { result: objectResult } = renderHook(() => useDebounce(obj, 100));
    expect(objectResult.current).toEqual(obj);

    const arr = [1, 2, 3];
    const { result: arrayResult } = renderHook(() => useDebounce(arr, 100));
    expect(arrayResult.current).toEqual(arr);

    const { result: nullResult } = renderHook(() => useDebounce(null, 100));
    expect(nullResult.current).toBeNull();

    const { result: undefinedResult } = renderHook(() => useDebounce(undefined, 100));
    expect(undefinedResult.current).toBeUndefined();
  });

  it('delay가 0이면 즉시 업데이트된다', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 0 } }
    );

    rerender({ value: 'updated', delay: 0 });

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(result.current).toBe('updated');
  });
});
