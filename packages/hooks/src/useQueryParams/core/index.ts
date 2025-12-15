export interface Parser<T> {
  parse: (value: string | null) => T | null;
  serialize: (value: T) => string;
}

export interface ParserBuilder<T> extends Parser<T> {
  defaultValue?: T;
  withDefault: (defaultValue: NonNullable<T>) => ParserBuilder<NonNullable<T>>;
}

export function createParser<T>(parser: Parser<T>): ParserBuilder<T> {
  return {
    ...parser,
    defaultValue: undefined,
    withDefault(defaultValue: NonNullable<T>) {
      return {
        ...this,
        defaultValue,
        parse: (value: string | null) => {
          const parsed = parser.parse(value);
          return parsed ?? defaultValue;
        },
      } as ParserBuilder<NonNullable<T>>;
    },
  };
}
