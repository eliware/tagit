import { reportNpmViewFailure } from "./failure.mjs";
import { reportNpmViewResult } from "./result.mjs";
import { npmViewHasVersion } from "../../view-response.mjs";

export function reportNpmViewAttempt(log, status, attempt) {
  if ("error" in attempt) {
    reportNpmViewFailure(log, status, attempt.error);
    return false;
  }
  const exists = npmViewHasVersion(attempt.output, attempt.version);
  reportNpmViewResult(log, status, exists);
  return exists;
}
