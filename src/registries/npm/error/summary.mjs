import classifyNpmError from "./classification.mjs";
import classifyNpmErrorSummary from "./summary/classify.mjs";

export default function npmErrorSummary(error) {
  return classifyNpmErrorSummary(classifyNpmError(error));
}
