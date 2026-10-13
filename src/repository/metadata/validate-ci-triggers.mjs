import { hasMainPushTrigger } from "./workflow-triggers.mjs";
import { jobValue } from "./workflow-job-rules.mjs";

export function validateCiTriggers(trigger) {
  const failures = [];
  if (!hasMainPushTrigger(trigger))
    failures.push("BLOCKED: CI workflow must run on pushes to main.");
  if (
    !trigger.some(
      (line) => jobValue([line], "pull_request") !== null || line.trim() === "pull_request:",
    )
  )
    failures.push("BLOCKED: CI workflow must run on pull requests.");
  return failures;
}
