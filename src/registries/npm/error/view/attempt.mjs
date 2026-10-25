import { classifyNpmViewAvailability } from "./availability-policy.mjs";
import { readNpmViewResponse } from "./response-reader.mjs";
import { classifyNpmViewFailure } from "./failure-policy.mjs";

export function classifyNpmViewAttempt(attempt) {
  const failure = classifyNpmViewFailure(attempt);
  if (failure) return failure;
  return {
    type: "result",
    exists:
      classifyNpmViewAvailability(readNpmViewResponse(attempt.output), attempt.version) ===
      "available",
  };
}
