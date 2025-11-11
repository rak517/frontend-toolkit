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
 *
 * @returns 달력 데이터 및 네비게이션 함수
 *
 * @example
 * ```tsx
 * // Date 객체
 * const cal1 = useCalendar({ defaultDate: new Date(2024, 0, 15) });
 *
 * // ISO 문자열 (URL에서 가져온 경우)
 * const [params] = useSearchParams();
 * const cal2 = useCalendar({ defaultDate: params.get('date') ?? undefined });
 *
 * // 년-월만 지정
 * const cal3 = useCalendar({ defaultDate: "2024-01" });
 *
 * // timestamp
 * const cal4 = useCalendar({ defaultDate: 1705276800000 });
 * ```
 */
export function useCalendar(options: UseCalendarOptions = {}) {
  const { defaultDate = new Date(), weekStartsOn = 0 } = options;

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

  const prev = useCallback(() => {
    setCurrentDate(date => subMonths(date, 1));
  }, []);

  const next = useCallback(() => {
    setCurrentDate(date => addMonths(date, 1));
  }, []);

  const today = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  return {
    days,
    weekdays,
    currentDate,
    prev,
    next,
    today,
    setDate: setCurrentDate,
  };
}
