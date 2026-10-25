import { classifyNpmError } from "./classification.mjs";
import { classifyNpmErrorSummary } from "./summary/classify.mjs";

export function npmErrorSummary(error) {
  return classifyNpmErrorSummary(classifyNpmError(error));
}
