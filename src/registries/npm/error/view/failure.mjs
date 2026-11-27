import npmErrorSummary from "../summary.mjs";

export default function reportNpmViewFailure(log, status, error) {
  log.info?.(`${status}: failed (${npmErrorSummary(error)}).`);
}
