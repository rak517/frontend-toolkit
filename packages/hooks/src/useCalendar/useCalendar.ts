import { useCallback, useMemo, useState } from 'react';
import type { UseCalendarOptions } from './types';
import { createCalendar, createWeekdays, parseDate } from './core';
import { addMonths, subMonths } from 'date-fns';

/**
 * 달력 Hook
 *
 * 달력 데이터와 네비게이션을 제공합니다.
 * UI는 완전히 사용자가 제어하며, 이 Hook은 로직만 제공합니다.
 *
 * @param options - 달력 옵션
 * @param options.defaultDate - 초기 날짜 (Date, ISO 문자열, timestamp)
 * @param options.weekStartsOn - 주 시작일 (0: 일요일, 1: 월요일)
 * @param options.onChange - 날짜 변경 시 호출되는 콜백
 *
 * @returns 달력 데이터 및 네비게이션 함수
 *
 * @example
 * ```tsx
 * // 기본 사용
 * const cal = useCalendar();
 *
 * // URL 쿼리 파라미터와 동기화
 * const [searchParams, setSearchParams] = useSearchParams();
 * const cal = useCalendar({
 *   defaultDate: searchParams.get('date') ?? undefined,
 *   onChange: (date) => {
 *     setSearchParams({ date: format(date, 'yyyy-MM') });
 *   }
 * });
 *
 * // 상태 관리와 통합
 * const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
 * const cal = useCalendar({
 *   defaultDate: selectedMonth,
 *   onChange: setSelectedMonth
 * });
 * ```
 */
export function useCalendar(options: UseCalendarOptions = {}) {
  const { defaultDate = new Date(), weekStartsOn = 0, onChange } = options;

  const initialDate = useMemo(() => parseDate(defaultDate), [defaultDate]);

  const [currentDate, setCurrentDate] = useState(initialDate);

  const days = useMemo(
    () => createCalendar(currentDate, { weekStartsOn }),
    [currentDate, weekStartsOn]
  );

  const weekdays = useMemo(
    () => createWeekdays(currentDate, weekStartsOn),
    [currentDate, weekStartsOn]
  );

  const updateDate = useCallback(
    (newDate: Date | ((prev: Date) => Date)) => {
      setCurrentDate(prev => {
        const next = typeof newDate === 'function' ? newDate(prev) : newDate;
        onChange?.(next);
        return next;
      });
    },
    [onChange]
  );

  const prev = useCallback(() => {
    updateDate(date => subMonths(date, 1));
  }, []);

  const next = useCallback(() => {
    updateDate(date => addMonths(date, 1));
  }, []);

  const today = useCallback(() => {
    updateDate(new Date());
  }, []);

  const setDate = useCallback(
    (date: Date) => {
      updateDate(date);
    },
    [updateDate]
  );

  return {
    days,
    weekdays,
    currentDate,
    prev,
    next,
    today,
    setDate,
  };
}
