export type ParserInput = string | string[] | null;

export interface Parser<T> {
  parse: (value: ParserInput) => T | null;
  serialize: (value: T) => string;
}

export function normalizeInput(value: ParserInput): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

export interface ParserBuilder<T> extends Parser<T> {
  defaultValue?: T;
  withDefault: (
    defaultValue: NonNullable<T>
  ) => ParserBuilder<NonNullable<T>> & { defaultValue: NonNullable<T> };
}

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
