import { isAbsolute } from "node:path";
import { z } from "zod";

/**
 * 절대 경로 검증 스키마
 * 상대 경로 입력 시 명확한 에러 메시지 반환
 */
export const absolutePathSchema = z.string().refine((p) => isAbsolute(p), {
  message: "절대 경로를 입력해주세요 (예: /Users/.../file.ts)",
});
