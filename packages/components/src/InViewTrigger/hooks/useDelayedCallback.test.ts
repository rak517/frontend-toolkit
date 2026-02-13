import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDelayedCallback } from './useDelayedCallback';

describe('useDelayedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('delay가 0이면 즉시 실행된다', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDelayedCallback(callback, 0));

    act(() => {
      result.current.schedule('인자');
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('인자');
  });

  it('delay 설정 시 지연 후 실행된다', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDelayedCallback(callback, 300));

    act(() => {
      result.current.schedule('인자');
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('인자');
  });

  it('cancel() 호출 시 예약된 콜백이 취소된다', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDelayedCallback(callback, 300));

    act(() => {
      result.current.schedule('인자');
    });

    act(() => {
      result.current.cancel();
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('새 schedule() 호출 시 이전 예약이 취소된다', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDelayedCallback(callback, 300));

    act(() => {
      result.current.schedule('첫 번째');
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    act(() => {
      result.current.schedule('두 번째');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('두 번째');
  });

  it('언마운트 시 타이머가 정리된다', () => {
    const callback = vi.fn();
    const { result, unmount } = renderHook(() => useDelayedCallback(callback, 300));

    act(() => {
      result.current.schedule('인자');
    });

    unmount();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).not.toHaveBeenCalled();
  });
});
