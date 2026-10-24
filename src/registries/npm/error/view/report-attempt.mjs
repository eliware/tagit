import { classifyNpmViewAttempt } from "./attempt.mjs";
import { reportNpmViewFailure } from "./failure.mjs";
import { reportNpmViewResult } from "./result.mjs";

export function reportNpmViewAttempt(log, status, attempt) {
  const result = classifyNpmViewAttempt(attempt);
  if (result.type === "failure") {
    reportNpmViewFailure(log, status, result.error);
    return false;
  }
  reportNpmViewResult(log, status, result.exists);
  return result.exists;
}
