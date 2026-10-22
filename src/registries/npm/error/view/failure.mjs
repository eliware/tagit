import { npmErrorSummary } from "../summary.mjs";

export function reportNpmViewFailure(log, status, error) {
  log.info?.(`${status}: failed (${npmErrorSummary(error)}).`);
}
