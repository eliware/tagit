export function classifyNpmErrorSummary(classification) {
  if (classification.type === "not-found") return "404 not found";
  if (classification.type === "code" && /^[A-Z0-9_-]+$/i.test(classification.code))
    return classification.code;
  return "request failed";
}
