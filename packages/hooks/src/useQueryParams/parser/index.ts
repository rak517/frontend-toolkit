import { createParser, normalizeInput, type Parser, type ParserInput } from '../core';

/**
 * 문자열 파서
 *
 * @example
 * ```tsx
 * const { name } = useQueryParams({
 *   name: parseAsString.withDefault(''),
 * });
 * // ?name=hello -> 'hello'
 * ```
 */
export const parseAsString = createParser<string | null>({
  parse: value => normalizeInput(value),
  serialize: value => value ?? '',
});

/**
 * 정수 파서
 *
 * @example
 * ```tsx
 * const { page } = useQueryParams({
 *   page: parseAsInteger.withDefault(1),
 * });
 * // ?page=5 -> 5
 * ```
 */
export const parseAsInteger = createParser<number | null>({
  parse: value => {
    const v = normalizeInput(value);
    if (v === null) return null;
    const num = parseInt(v, 10);
    return isNaN(num) ? null : num;
  },
  serialize: value => String(value),
});

/**
 * 실수(부동소수점) 파서
 *
 * @example
 * ```tsx
 * const { price } = useQueryParams({
 *   price: parseAsFloat.withDefault(0),
 * });
 * // ?price=19.99 -> 19.99
 * ```
 */
export const parseAsFloat = createParser<number | null>({
  parse: value => {
    const v = normalizeInput(value);
    if (v === null) return null;
    const num = parseFloat(v);
    return isNaN(num) ? null : num;
  },
  serialize: value => String(value),
});

/**
 * 불리언 파서
 *
 * @example
 * ```tsx
 * const { showCompleted } = useQueryParams({
 *   showCompleted: parseAsBoolean.withDefault(false),
 * });
 * // ?showCompleted=true -> true
 * ```
 */
export const parseAsBoolean = createParser<boolean | null>({
  parse: value => {
    const v = normalizeInput(value);
    if (v === 'true') return true;
    if (v === 'false') return false;
    return null;
  },
  serialize: value => String(value),
});

/**
 * ISO 날짜 파서 (YYYY-MM-DD)
 *
 * @example
 * ```tsx
 * const { startDate } = useQueryParams({
 *   startDate: parseAsIsoDate,
 * });
 * // ?startDate=2024-01-15 -> Date 객체
 * ```
 */
export const parseAsIsoDate = createParser<Date | null>({
  parse: value => {
    const v = normalizeInput(value);
    if (v === null) return null;
    const date = new Date(v);
    return isNaN(date.getTime()) ? null : date;
  },
  serialize: value => value?.toISOString().split('T')[0] ?? '',
});

/**
 * ISO DateTime 파서 (YYYY-MM-DDTHH:mm:ss.sssZ)
 *
 * @example
 * ```tsx
 * const { createdAt } = useQueryParams({
 *   createdAt: parseAsIsoDateTime,
 * });
 * // ?createdAt=2024-01-15T09:30:00.000Z -> Date 객체
 * ```
 */
export const parseAsIsoDateTime = createParser<Date | null>({
  parse: value => {
    const v = normalizeInput(value);
    if (v === null) return null;
    const date = new Date(v);
    return isNaN(date.getTime()) ? null : date;
  },
  serialize: value => value?.toISOString() ?? '',
});

/**
 * JSON 파서
 *
 * @example
 * ```tsx
 * const { filters } = useQueryParams({
 *   filters: parseAsJson<{ status: string; priority: number }>(),
 * });
 * // ?filters={"status":"active","priority":1} -> { status: 'active', priority: 1 }
 * ```
 */
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

/**
 * 문자열 Enum 파서
 *
 * @param values - 허용되는 값 목록
 *
 * @example
 * ```tsx
 * const sortOptions = ['latest', 'oldest', 'popular'] as const;
 * const { sort } = useQueryParams({
 *   sort: parseAsStringEnum(sortOptions).withDefault('latest'),
 * });
 * // ?sort=oldest -> 'oldest'
 * // ?sort=invalid -> 'latest' (기본값)
 * ```
 */
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

/**
 * 리터럴 파서 (parseAsStringEnum의 별칭)
 *
 * @param values - 허용되는 값 목록
 *
 * @example
 * ```tsx
 * const { status } = useQueryParams({
 *   status: parseAsLiteral(['active', 'inactive'] as const),
 * });
 * ```
 */
export function parseAsLiteral<T extends string>(values: readonly T[]) {
  return parseAsStringEnum(values);
}

/**
 * 배열 파서 (쉼표 구분)
 *
 * @param itemParser - 배열 아이템을 파싱할 파서
 * @param separator - 구분자 (기본값: ',')
 *
 * @example
 * ```tsx
 * const { tags } = useQueryParams({
 *   tags: parseAsArray(parseAsString).withDefault([]),
 * });
 * // ?tags=react,typescript,nextjs -> ['react', 'typescript', 'nextjs']
 * ```
 */
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

/**
 * 네이티브 배열 파서 (복수 파라미터)
 *
 * URL에서 같은 키로 여러 값을 전달할 때 사용
 *
 * @param itemParser - 배열 아이템을 파싱할 파서
 *
 * @example
 * ```tsx
 * const { ids } = useQueryParams({
 *   ids: parseAsNativeArray(parseAsInteger).withDefault([]),
 * });
 * // ?ids=1&ids=2&ids=3 -> [1, 2, 3]
 * ```
 */
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
