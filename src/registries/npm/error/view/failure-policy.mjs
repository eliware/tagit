export function classifyNpmViewFailure(attempt) {
  if ("error" in attempt) return { type: "failure", error: attempt.error };
  return null;
}
