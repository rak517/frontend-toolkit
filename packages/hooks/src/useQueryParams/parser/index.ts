import { createParser, normalizeInput, type Parser, type ParserInput } from '../core';

// 문자열
export const parseAsString = createParser<string | null>({
  parse: value => normalizeInput(value),
  serialize: value => value ?? '',
});

// 정수
export const parseAsInteger = createParser<number | null>({
  parse: value => {
    const v = normalizeInput(value);
    if (v === null) return null;
    const num = parseInt(v, 10);
    return isNaN(num) ? null : num;
  },
  serialize: value => String(value),
});

// 실수
export const parseAsFloat = createParser<number | null>({
  parse: value => {
    const v = normalizeInput(value);
    if (v === null) return null;
    const num = parseFloat(v);
    return isNaN(num) ? null : num;
  },
  serialize: value => String(value),
});

// 불리언
export const parseAsBoolean = createParser<boolean | null>({
  parse: value => {
    const v = normalizeInput(value);
    if (v === 'true') return true;
    if (v === 'false') return false;
    return null;
  },
  serialize: value => String(value),
});

// ISO 날짜
export const parseAsIsoDate = createParser<Date | null>({
  parse: value => {
    const v = normalizeInput(value);
    if (v === null) return null;
    const date = new Date(v);
    return isNaN(date.getTime()) ? null : date;
  },
  serialize: value => value?.toISOString().split('T')[0] ?? '',
});

// ISO DateTime
export const parseAsIsoDateTime = createParser<Date | null>({
  parse: value => {
    const v = normalizeInput(value);
    if (v === null) return null;
    const date = new Date(v);
    return isNaN(date.getTime()) ? null : date;
  },
  serialize: value => value?.toISOString() ?? '',
});

// JSON
export function parseAsJson<T>() {
  return createParser<T | null>({
    parse: value => {
      const v = normalizeInput(value);
      if (v === null) return null;
      try {
        return JSON.parse(v) as T;
      } catch {
        return null;
      }
    },
    serialize: value => JSON.stringify(value),
  });
}

// 문자열 Enum
export function parseAsStringEnum<T extends string>(values: readonly T[]) {
  return createParser<T | null>({
    parse: value => {
      const v = normalizeInput(value);
      if (v === null) return null;
      return values.includes(v as T) ? (v as T) : null;
    },
    serialize: value => value ?? '',
  });
}

// 리터럴 (stringEnum과 동일하지만 의미적 구분)
export function parseAsLiteral<T extends string>(values: readonly T[]) {
  return parseAsStringEnum(values);
}

// 배열 (쉼표 구분)
export function parseAsArray<T>(itemParser: Parser<T>, separator = ',') {
  return createParser<T[]>({
    parse: value => {
      const v = normalizeInput(value);
      if (v === null || v === '') return [];
      return v
        .split(separator)
        .map(item => itemParser.parse(item))
        .filter((item): item is T => item !== null);
    },
    serialize: value => value.map(item => itemParser.serialize(item)).join(separator),
  });
}

// 배열 (복수 파라미터 - 네이티브)
export function parseAsNativeArray<T>(itemParser: Parser<T>) {
  return createParser<T[]>({
    parse: (value: ParserInput) => {
      if (value === null) return [];
      const arr = Array.isArray(value) ? value : [value];
      return arr
        .map(item => itemParser.parse(item))
        .filter((item): item is T => item !== null);
    },
    serialize: value => value.map(item => itemParser.serialize(item)).join(','),
  });
}
