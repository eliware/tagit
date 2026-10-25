import { classifyNpmViewResult } from "./result-policy.mjs";
import { readNpmViewResponse } from "./response-reader.mjs";

export function classifyNpmViewAttempt(attempt) {
  if ("error" in attempt) return { type: "failure", error: attempt.error };
  return {
    type: "result",
    exists:
      classifyNpmViewResult(readNpmViewResponse(attempt.output), attempt.version) === "available",
  };
}
