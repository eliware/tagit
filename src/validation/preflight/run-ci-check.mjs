import { verifyPreflightCi } from "../ci/verify-preflight-ci.mjs";
import { ciFailureMessage } from "./ci-failure-message.mjs";

export function runCiCheck(execFileSync, log, status, fs) {
  const result = verifyPreflightCi(execFileSync, log, status, fs);
  return { result, failure: ciFailureMessage(result.error) };
}
