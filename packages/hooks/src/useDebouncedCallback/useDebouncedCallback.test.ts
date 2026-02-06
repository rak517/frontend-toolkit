import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebouncedCallback } from './useDebouncedCallback';

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('기본 동작', () => {
    it('지정된 delay 후에 콜백이 실행된다', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 500));

      act(() => {
        result.current('test');
      });

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('test');
    });

    it('delay 내 여러 번 호출 시 마지막 호출만 실행된다', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 500));

      act(() => {
        result.current('first');
        result.current('second');
        result.current('third');
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('third');
    });

    it('delay 내 호출 시 타이머가 리셋된다', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 500));

      act(() => {
        result.current('first');
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      act(() => {
        result.current('second');
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('second');
    });
  });

  describe('leading 옵션', () => {
    it('leading: true일 때 첫 호출이 즉시 실행된다', () => {
      const callback = vi.fn();
      const { result } = renderHook(() =>
        useDebouncedCallback(callback, 500, { leading: true })
      );

      act(() => {
        result.current('test');
      });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('test');
    });

    it('leading: true, trailing: true일 때 첫 호출과 마지막 호출 모두 실행된다', () => {
      const callback = vi.fn();
      const { result } = renderHook(() =>
        useDebouncedCallback(callback, 500, { leading: true, trailing: true })
      );

      act(() => {
        result.current('first');
        result.current('second');
      });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('first');

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenLastCalledWith('second');
    });

    it('leading: true, trailing: false일 때 첫 호출만 실행된다', () => {
      const callback = vi.fn();
      const { result } = renderHook(() =>
        useDebouncedCallback(callback, 500, { leading: true, trailing: false })
      );

      act(() => {
        result.current('first');
        result.current('second');
      });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('first');

      act(() => {
        vi.advanceTimersByTime(500);
      });

      // trailing: false이므로 추가 호출 없음
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('trailing 옵션', () => {
    it('trailing: false일 때 delay 후 콜백이 실행되지 않는다', () => {
      const callback = vi.fn();
      const { result } = renderHook(() =>
        useDebouncedCallback(callback, 500, { trailing: false })
      );

      act(() => {
        result.current('test');
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('maxWait 옵션', () => {
    it('maxWait 시간이 지나면 강제로 실행된다', () => {
      const callback = vi.fn();
      const { result } = renderHook(() =>
        useDebouncedCallback(callback, 500, { maxWait: 1000 })
      );

      act(() => {
        result.current('first');
      });

      act(() => {
        vi.advanceTimersByTime(400);
        result.current('second');
      });

      act(() => {
        vi.advanceTimersByTime(400);
        result.current('third');
      });

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(200);
      });

      // maxWait 1000ms 도달
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('third');
    });

    it('maxWait 실행 후 타이머가 정리된다', () => {
      const callback = vi.fn();
      const { result } = renderHook(() =>
        useDebouncedCallback(callback, 500, { maxWait: 1000 })
      );

      act(() => {
        result.current('test');
      });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(callback).toHaveBeenCalledTimes(1);

      // 추가 500ms 후에도 중복 호출 없음
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('언마운트', () => {
    it('언마운트 시 타이머가 정리된다', () => {
      const callback = vi.fn();
      const { result, unmount } = renderHook(() =>
        useDebouncedCallback(callback, 500)
      );

      act(() => {
        result.current('test');
      });

      unmount();

      act(() => {
        vi.advanceTimersByTime(500);
      });

      // 언마운트 후에는 콜백이 실행되지 않음
      expect(callback).not.toHaveBeenCalled();
    });

    it('maxWait 타이머도 언마운트 시 정리된다', () => {
      const callback = vi.fn();
      const { result, unmount } = renderHook(() =>
        useDebouncedCallback(callback, 500, { maxWait: 1000 })
      );

      act(() => {
        result.current('test');
      });

      unmount();

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('콜백 업데이트', () => {
    it('콜백이 변경되면 최신 콜백이 실행된다', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const { result, rerender } = renderHook(
        ({ cb }) => useDebouncedCallback(cb, 500),
        { initialProps: { cb: callback1 } }
      );

      act(() => {
        result.current('test');
      });

      rerender({ cb: callback2 });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledWith('test');
    });
  });
});
