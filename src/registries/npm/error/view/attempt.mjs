import { classifyNpmViewResult } from "./result-policy.mjs";

export function classifyNpmViewAttempt(attempt) {
  if ("error" in attempt) return { type: "failure", error: attempt.error };
  return {
    type: "result",
    exists: classifyNpmViewResult(attempt.output, attempt.version) === "available",
  };
}
