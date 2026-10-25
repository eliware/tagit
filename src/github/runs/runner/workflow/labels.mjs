import { classifyWorkflowRunnerValues } from "./platform-classifier.mjs";
import { parseRunnerValues } from "./values.mjs";
import { readRunnerValueDeclaration } from "./value-reader.mjs";

export function readWorkflowRunnerLabels(jobLines) {
  return classifyWorkflowRunnerValues(parseRunnerValues(readRunnerValueDeclaration(jobLines)));
}
