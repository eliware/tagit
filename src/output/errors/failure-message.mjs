import outputText from "./format-output.mjs";
import isCheckTimeout from "./is-check-timeout.mjs";
import timeoutFailureMessage from "./timeout-message.mjs";

export default function failureMessage(name, error, output) {
  if (isCheckTimeout(error)) return timeoutFailureMessage(name);
  return `BLOCKED: ${name} failed. Action: repair the reported issue, rerun it, then rerun tagit preflight.${outputText(output)}`;
}
