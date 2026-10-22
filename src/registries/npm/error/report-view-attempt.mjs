import { npmErrorSummary } from "./summary.mjs";

export function reportNpmViewResult(log, status, exists) {
  const result = exists ? "available" : "not found";
  log.info?.(`${status}: ${result}.`);
}

export function reportNpmViewFailure(log, status, error) {
  log.info?.(`${status}: failed (${npmErrorSummary(error)}).`);
}
