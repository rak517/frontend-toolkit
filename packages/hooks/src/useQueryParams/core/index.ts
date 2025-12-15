/**
 * 파서 입력 타입
 *
 * - `string`: 단일 쿼리 파라미터 값
 * - `string[]`: 복수 쿼리 파라미터 값 (?key=a&key=b)
 * - `null`: 쿼리 파라미터가 없는 경우
 */
export type ParserInput = string | string[] | null;

/**
 * 파서 인터페이스
 *
 * URL 쿼리 파라미터를 특정 타입으로 변환하고,
 * 다시 문자열로 직렬화하는 역할
 */
export interface Parser<T> {
  /** 문자열을 타입 T로 파싱 */
  parse: (value: ParserInput) => T | null;
  /** 타입 T를 문자열로 직렬화 */
  serialize: (value: T) => string;
}

/**
 * 파서 입력값을 단일 문자열로 정규화
 *
 * 배열인 경우 첫 번째 요소만 반환
 */
export function normalizeInput(value: ParserInput): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

/**
 * 파서 빌더 인터페이스
 *
 * 기본 파서에 `.withDefault()` 메서드를 추가하여
 * 기본값 설정 및 타입 추론을 지원
 */
export interface ParserBuilder<T> extends Parser<T> {
  /** 기본값 (withDefault 호출 시 설정됨) */
  defaultValue?: T;
  /**
   * 기본값 설정
   * @param defaultValue - 쿼리 파라미터가 없을 때 사용할 기본값
   * @returns 기본값이 설정된 파서 빌더
   */
  withDefault: (
    defaultValue: NonNullable<T>
  ) => ParserBuilder<NonNullable<T>> & { defaultValue: NonNullable<T> };
}

/**
 * 파서 빌더 생성 팩토리 함수
 *
 * 기본 파서를 받아서 `.withDefault()` 메서드가 추가된 파서 빌더를 반환
 *
 * @param parser - 기본 파서 (parse, serialize 메서드 포함)
 * @returns 파서 빌더
 *
 * @example
 * ```tsx
 * const parseAsCustom = createParser<CustomType>({
 *   parse: (value) => { ... },
 *   serialize: (value) => { ... },
 * });
 * ```
 */
export function createParser<T>(parser: Parser<T>): ParserBuilder<T> {
  return {
    ...parser,
    defaultValue: undefined,
    withDefault(defaultValue: NonNullable<T>) {
      return {
        ...this,
        defaultValue,
        parse: (value: ParserInput) => {
          const parsed = parser.parse(value);
          return parsed ?? defaultValue;
        },
      } as ParserBuilder<NonNullable<T>> & { defaultValue: NonNullable<T> };
    },
  };
}
