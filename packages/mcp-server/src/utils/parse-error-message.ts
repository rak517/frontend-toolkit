import type { TestErrorInfo } from "../tools/test/run-tests.js";
import { parseStackTrace } from "./parse-stack-trace.js";
import { ANSI_REGEX } from "./constants.js";

/**
 * vitest/jest의 failureMessage에서 expected, actual 값을 추출
 *
 * 지원 패턴:
 * 1. Expected [label]: "value" / Received [label]: "value"
 *    - Expected: "hello" / Received: "world"
 *    - Expected substring: "xyz" / Received string: "hello world"
 *    - Expected value: 4 / Received array: [1, 2, 3]
 *    - Expected length: 3 / Received length: 2
 *    - Expected pattern: /xyz/ / Received string: "hello world"
 * 2. expected 'actual' to <matcher> 'expected'
 * 3. expected {actual} to <matcher> {expected}
 * 4. expected <actual> to <matcher> <expected>
 */
export function parseErrorMessage(failureMessage: string): TestErrorInfo {
  const cleanMessage = failureMessage.replace(ANSI_REGEX, "");

  const result: TestErrorInfo = {
    message: cleanMessage,
    stack: parseStackTrace(failureMessage),
  };

  // 패턴 1: Expected [label]: "value" / Received [label]: "value"
  const expectedMatch = cleanMessage.match(
    /Expected(?:\s+\w+)*:\s*(?:"([^"]+)"|'([^']+)'|(\S+))/i
  );
  const receivedMatch = cleanMessage.match(
    /Received(?:\s+\w+)*:\s*(?:"([^"]+)"|'([^']+)'|(\S+))/i
  );

  if (expectedMatch || receivedMatch) {
    if (expectedMatch) {
      result.expected =
        expectedMatch[1] ?? expectedMatch[2] ?? expectedMatch[3];
    }
    if (receivedMatch) {
      result.actual = receivedMatch[1] ?? receivedMatch[2] ?? receivedMatch[3];
    }
    return result;
  }

  // 패턴 2: expected 'actual' to <matcher> 'expected' (문자열)
  const quotedMatch = cleanMessage.match(/expected '([^']*)' to .+ '([^']*)'/i);
  if (quotedMatch) {
    result.actual = quotedMatch[1];
    result.expected = quotedMatch[2];
    return result;
  }

  const firstLine = cleanMessage.split("\n")[0] ?? "";
  const cleaned = firstLine.replace(/\s*\/\/.*$/, "");

  // 패턴 3: expected {actual} to <matcher> {expected} (객체)
  const objectMatch = cleaned.match(/expected (\{.+\}) to .+ (\{.+\})$/i);
  if (objectMatch) {
    result.actual = objectMatch[1];
    result.expected = objectMatch[2];
    return result;
  }

  // 패턴 4: expected <actual> to <matcher> <expected> (숫자, boolean 등)
  const generalMatch = cleaned.match(/expected (.+) to .+ (\S+)$/i);
  if (generalMatch) {
    result.actual = generalMatch[1];
    result.expected = generalMatch[2];
    return result;
  }

  return result;
}
