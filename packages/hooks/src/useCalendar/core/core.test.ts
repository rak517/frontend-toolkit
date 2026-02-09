import { describe, it, expect } from 'vitest';
import { createCalendar, createWeekdays, parseDate } from './index';

describe('parseDate', () => {
  it('Date 객체를 그대로 반환한다', () => {
    const date = new Date(2024, 0, 15);
    expect(parseDate(date)).toBe(date);
  });

  it('유효하지 않은 Date 객체는 현재 날짜를 반환한다', () => {
    const invalid = new Date('invalid');
    const result = parseDate(invalid);
    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).not.toBeNaN();
  });

  it('timestamp를 Date로 변환한다', () => {
    const timestamp = new Date(2024, 0, 15).getTime();
    const result = parseDate(timestamp);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(15);
  });

  it('유효하지 않은 timestamp는 현재 날짜를 반환한다', () => {
    const result = parseDate(NaN);
    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).not.toBeNaN();
  });

  it('ISO 문자열을 Date로 변환한다', () => {
    const result = parseDate('2024-01-15');
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(15);
  });

  it('년-월 형식 문자열을 Date로 변환한다 (01일로 설정)', () => {
    const result = parseDate('2024-06');
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(5);
    expect(result.getDate()).toBe(1);
  });

  it('유효하지 않은 문자열은 현재 날짜를 반환한다', () => {
    const result = parseDate('invalid');
    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).not.toBeNaN();
  });
});

describe('createCalendar', () => {
  it('항상 42개의 날짜를 반환한다', () => {
    const days = createCalendar(new Date(2024, 0, 15));
    expect(days).toHaveLength(42);
  });

  it('각 날짜가 올바른 속성을 가진다', () => {
    const days = createCalendar(new Date(2024, 0, 15));
    const day = days[0];

    expect(day).toHaveProperty('date');
    expect(day).toHaveProperty('day');
    expect(day).toHaveProperty('isCurrentMonth');
    expect(day).toHaveProperty('isToday');
    expect(day).toHaveProperty('isWeekend');
    expect(day.date).toBeInstanceOf(Date);
    expect(typeof day.day).toBe('number');
  });

  it('현재 달의 날짜에 isCurrentMonth가 true로 설정된다', () => {
    const days = createCalendar(new Date(2024, 0, 15));
    const januaryDays = days.filter(d => d.isCurrentMonth);

    expect(januaryDays).toHaveLength(31);
    januaryDays.forEach(d => {
      expect(d.date.getMonth()).toBe(0);
    });
  });

  it('이전/다음 달 날짜에 isCurrentMonth가 false로 설정된다', () => {
    const days = createCalendar(new Date(2024, 0, 15));
    const otherMonthDays = days.filter(d => !d.isCurrentMonth);

    expect(otherMonthDays.length).toBeGreaterThan(0);
    otherMonthDays.forEach(d => {
      expect(d.date.getMonth()).not.toBe(0);
    });
  });

  it('주말에 isWeekend가 true로 설정된다', () => {
    const days = createCalendar(new Date(2024, 0, 15));
    const weekendDays = days.filter(d => d.isWeekend);

    weekendDays.forEach(d => {
      const dayOfWeek = d.date.getDay();
      expect(dayOfWeek === 0 || dayOfWeek === 6).toBe(true);
    });
  });

  it('weekStartsOn: 0일 때 일요일부터 시작한다', () => {
    const days = createCalendar(new Date(2024, 0, 15), { weekStartsOn: 0 });
    expect(days[0].date.getDay()).toBe(0);
  });

  it('weekStartsOn: 1일 때 월요일부터 시작한다', () => {
    const days = createCalendar(new Date(2024, 0, 15), { weekStartsOn: 1 });
    expect(days[0].date.getDay()).toBe(1);
  });

  it('날짜가 연속적으로 정렬된다', () => {
    const days = createCalendar(new Date(2024, 0, 15));

    for (let i = 1; i < days.length; i++) {
      const diff = days[i].date.getTime() - days[i - 1].date.getTime();
      const oneDay = 24 * 60 * 60 * 1000;
      expect(diff).toBe(oneDay);
    }
  });

  it('윤년 2월을 올바르게 처리한다', () => {
    const days = createCalendar(new Date(2024, 1, 1));
    const febDays = days.filter(d => d.isCurrentMonth);
    expect(febDays).toHaveLength(29);
  });

  it('평년 2월을 올바르게 처리한다', () => {
    const days = createCalendar(new Date(2023, 1, 1));
    const febDays = days.filter(d => d.isCurrentMonth);
    expect(febDays).toHaveLength(28);
  });
});

describe('createWeekdays', () => {
  it('7개의 요일을 반환한다', () => {
    const weekdays = createWeekdays(new Date(2024, 0, 15), 0);
    expect(weekdays).toHaveLength(7);
  });

  it('각 요일이 올바른 속성을 가진다', () => {
    const weekdays = createWeekdays(new Date(2024, 0, 15), 0);
    const weekday = weekdays[0];

    expect(weekday).toHaveProperty('date');
    expect(weekday).toHaveProperty('label');
    expect(weekday).toHaveProperty('labelLong');
    expect(weekday).toHaveProperty('index');
    expect(typeof weekday.label).toBe('string');
    expect(typeof weekday.labelLong).toBe('string');
  });

  it('weekStartsOn: 0일 때 일요일부터 시작한다', () => {
    const weekdays = createWeekdays(new Date(2024, 0, 15), 0);
    expect(weekdays[0].index).toBe(0);
    expect(weekdays[6].index).toBe(6);
  });

  it('weekStartsOn: 1일 때 월요일부터 시작한다', () => {
    const weekdays = createWeekdays(new Date(2024, 0, 15), 1);
    expect(weekdays[0].index).toBe(1);
    expect(weekdays[6].index).toBe(0);
  });

  it('한국어 로케일로 요일 라벨이 생성된다', () => {
    const weekdays = createWeekdays(new Date(2024, 0, 15), 0);
    const labels = weekdays.map(w => w.label);
    expect(labels).toContain('일');
    expect(labels).toContain('월');
  });
});
