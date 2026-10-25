import { classifyNpmViewResult } from "./result-policy.mjs";
import { readNpmViewResponse } from "./response-reader.mjs";
import { classifyNpmViewFailure } from "./failure-policy.mjs";

export function classifyNpmViewAttempt(attempt) {
  const failure = classifyNpmViewFailure(attempt);
  if (failure) return failure;
  return {
    type: "result",
    exists:
      classifyNpmViewResult(readNpmViewResponse(attempt.output), attempt.version) === "available",
  };
}
