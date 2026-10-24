import { reportNpmViewFailure } from "./failure.mjs";
import { reportNpmViewResult } from "./result.mjs";
import { classifyNpmViewResult } from "./result-policy.mjs";

export function reportNpmViewAttempt(log, status, attempt) {
  if ("error" in attempt) {
    reportNpmViewFailure(log, status, attempt.error);
    return false;
  }
  const exists = classifyNpmViewResult(attempt.output, attempt.version) === "available";
  reportNpmViewResult(log, status, exists);
  return exists;
}
