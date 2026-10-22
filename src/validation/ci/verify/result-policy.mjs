import { buildCiVerificationFailure } from "../build-ci-verification-failure.mjs";
import { buildPlatformVerificationFailure } from "../platform-verification-failure.mjs";

export function createCiVerificationFailure(execFileSync, candidates, runs, headSha) {
  const message = candidates.length
    ? buildPlatformVerificationFailure(execFileSync, candidates, headSha)
    : buildCiVerificationFailure(runs, headSha);
  return new Error(message);
}
