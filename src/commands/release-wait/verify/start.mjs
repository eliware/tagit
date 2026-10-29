import { execFile as defaultExecFile } from "node:child_process";
import { sleep as sleepDefault } from "../../../process/timing/sleep.mjs";
import { resolveReleaseContext } from "../resolve/release-context.mjs";
import { validateReleaseInput } from "../validate/input.mjs";
import { reportReleaseVerificationStart } from "../report/release/start-verification.mjs";

export async function startReleaseVerification(
  execFileSync,
  log,
  {
    version,
    release,
    pollMs = 10000,
    maxPolls = 30,
    sleep = sleepDefault,
    execFile = defaultExecFile,
  } = {},
) {
  validateReleaseInput(version, release, maxPolls, maxPolls, pollMs, pollMs);
  const { repo, tag, headSha } = resolveReleaseContext(execFileSync, version, release);
  return reportReleaseVerificationStart({
    execFile,
    repo,
    headSha,
    tag,
    pollMs,
    maxPolls,
    sleep,
    log,
  });
}
