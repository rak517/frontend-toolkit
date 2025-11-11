/**
 * 달력의 한 날짜 정보
 */
export interface CalendarDay {
  /** Date 객체 */
  date: Date;
  /** 날짜 (1-31) */
  day: number;
  /** 현재 달의 날짜인지 여부 */
  isCurrentMonth: boolean;
  /** 오늘 날짜인지 여부 */
  isToday: boolean;
  /** 주말인지 여부 */
  isWeekend: boolean;
}

/**
 * 달력 옵션
 */
export interface CalendarOptions {
  /** 주 시작일 (0: 일요일, 1: 월요일) */
  weekStartsOn?: 0 | 1;
}

/**
 * useCalendar 옵션
 */
export interface UseCalendarOptions extends CalendarOptions {
  /** 초기 날짜 (Date | "2024-06" | timestamp) */
  defaultDate?: Date | string | number;
  /** 날짜 변경 시 콜백 */
  onChange?: (date: Date) => void;
}

/**
 * 요일 정보
 */
export interface Weekday {
  date: Date;
  /** 요일 짧은 형식 (예: "월") */
  label: string;
  /** 요일 긴 형식 (예: "월요일") */
  labelLong: string;
  /** 요일 인덱스 (0-6) */
  index: number;
}
