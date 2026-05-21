/**
 * 훅 이름이 유효한지 검증한다.
 * - use로 시작해야 한다
 * - use 다음에 대문자가 와야 한다
 * - 영숫자만 포함해야 한다
 */
export function isValidHookName(name: string): boolean {
  return /^use[A-Z][a-zA-Z0-9]*$/.test(name);
}
