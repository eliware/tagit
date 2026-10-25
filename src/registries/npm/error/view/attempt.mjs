import { classifyNpmViewAvailability } from "./result/availability-policy.mjs";
import { readNpmViewResponse } from "./result/response-reader.mjs";
import { classifyNpmViewFailure } from "./result/failure-policy.mjs";

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
