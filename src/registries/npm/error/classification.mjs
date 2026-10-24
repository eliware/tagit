import { readNpmErrorDetail } from "./detail.mjs";

export function classifyNpmError(error) {
  const detail = readNpmErrorDetail(error);
  if (/\b404\b|E404|Not Found/i.test(detail)) return { type: "not-found" };
  if (error.code && /^[A-Z0-9_-]+$/i.test(String(error.code)))
    return { type: "code", code: String(error.code) };
  return { type: "request-failed" };
}
