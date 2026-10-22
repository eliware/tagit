import { classifyNpmError } from "./classification.mjs";

export function npmErrorSummary(error) {
  const classification = classifyNpmError(error);
  if (classification.type === "not-found") return "404 not found";
  if (classification.type === "code") return classification.code;
  return "request failed";
}
