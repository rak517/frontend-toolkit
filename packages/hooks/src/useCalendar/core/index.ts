import {
  addDays,
  format,
  isSameDay,
  isSameMonth,
  isValid,
  isWeekend,
  parseISO,
  setDay,
  startOfMonth,
  startOfWeek,
  type Locale,
} from 'date-fns';
import type { CalendarDay, UseCalendarOptions, Weekday } from '../types';
import { ko } from 'date-fns/locale';

/**
 * 다양한 날짜 형식을 Date 객체로 변환
 *
 * @param value - Date, ISO 문자열, 또는 timestamp
 * @returns 유효한 Date 객체 또는 현재 날짜
 *
 * @example
 * parseDate(new Date(2024, 0, 15))        // Date 객체 그대로
 * parseDate("2024-01-15")                 // ISO 문자열
 * parseDate("2024-01")                    // 년-월만
 * parseDate(1705276800000)                // timestamp
 * parseDate("invalid")                    // 현재 날짜 (fallback)
 */
export function parseDate(value: Date | string | number): Date {
  if (value instanceof Date) {
    return isValid(value) ? value : new Date();
  }

  if (typeof value === 'number') {
    const date = new Date(value);
    return isValid(date) ? date : new Date();
  }

  if (typeof value === 'string') {
    const normalized = value.length === 7 ? `${value}-01` : value;
    const date = parseISO(normalized);
    return isValid(date) ? date : new Date();
  }

  return new Date();
}

/**
 * 달력 시작일 계산
 *
 * @param date - 기준 날짜
 * @param weekStartsOn - 주 시작일 (0: 일요일, 1: 월요일)
 * @returns 달력의 첫 날짜
 *
 * @example
 * // 2024년 1월 1일(월요일), 주 시작=일요일
 * getCalendarStart(new Date(2024, 0, 1), 0)
 * // → 2023년 12월 31일(일요일)
 *
 * @example
 * // 2024년 1월 1일(월요일), 주 시작=월요일
 * getCalendarStart(new Date(2024, 0, 1), 1)
 * // → 2024년 1월 1일(월요일)
 */
function getCalendarStart(date: Date, weekStartsOn: 0 | 1): Date {
  const monthStart = startOfMonth(date);
  return startOfWeek(monthStart, { weekStartsOn });
}

/**
 * 달력 날짜 생성 (42개 고정)
 *
 * 42개를 생성하는 이유:
 * - 6주 × 7일 = 42일
 * - 대부분의 달은 5주지만, 6주인 경우도 있음
 * - 고정 크기로 레이아웃 안정성 확보
 *
 * @param baseDate - 보여줄 기준 날짜 (예: 2024년 1월 15일)
 * @param options - 달력 옵션
 * @returns 42개의 CalendarDay 배열 (Flat)
 *
 * @example
 * const days = createCalendar(new Date(2024, 0, 15), { weekStartsOn: 0 });
 * console.log(days.length); // 42
 * console.log(days[0].date); // 2023년 12월 31일 (전월)
 * console.log(days[6].date); // 2024년 1월 6일 (당월)
 */
export function createCalendar(
  baseDate: Date,
  options: UseCalendarOptions = {}
): CalendarDay[] {
  const { weekStartsOn = 0 } = options;
  const today = new Date();
  const calendarStart = getCalendarStart(baseDate, weekStartsOn);

  return Array.from<unknown, CalendarDay>({ length: 42 }, (_, index) => {
    const currentDate = addDays(calendarStart, index);

    return {
      date: currentDate,
      day: currentDate.getDate(),
      isCurrentMonth: isSameMonth(currentDate, baseDate),
      isToday: isSameDay(currentDate, today),
      isWeekend: isWeekend(currentDate),
    };
  });
}

/**
 * 요일 헤더 생성
 *
 * @param referenceDate - 기준 날짜
 * @param weekStartsOn - 주 시작일 (0: 일요일, 1: 월요일)
 * @returns 7개의 Weekday 배열
 *
 * @example
 * const weekdays = createWeekdays(new Date(), 0);
 * weekdays[0].short // "일"
 * weekdays[0].long  // "일요일"
 */
export function createWeekdays(
  referenceDate: Date,
  weekStartsOn: 0 | 1,
  locale: Locale = ko
): Weekday[] {
  return Array.from<unknown, Weekday>({ length: 7 }, (_, index) => {
    const date = setDay(referenceDate, (weekStartsOn + index) % 7, {
      weekStartsOn,
    });

    return {
      date,
      label: format(date, 'E', { locale }),
      labelLong: format(date, 'EEEE', { locale }),
      index: (weekStartsOn + index) % 7,
    };
  });
}
