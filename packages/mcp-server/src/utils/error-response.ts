import type { McpToolResponse } from "../types.js";

export function errorResponse(code: string, message: string): McpToolResponse {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({ error: code, message }),
      },
    ],
  };
}
