import { execFile as defaultExecFile } from "node:child_process";
import { sleep as sleepDefault } from "../../../process/timing/sleep.mjs";
import { prepareReleaseContext } from "../prepare-release-context.mjs";
import { reportReleaseVerificationStart } from "../report/release/start-verification.mjs";

export async function startReleaseVerification(
  execFileSync,
  fs,
  log,
  {
    version,
    release,
    pollMs = 10000,
    maxPolls = 30,
    npmRetries = maxPolls,
    npmRetryMs = pollMs,
    sleep = sleepDefault,
    execFile = defaultExecFile,
  } = {},
) {
  const { repo, tag, headSha, publication } = prepareReleaseContext(execFileSync, fs, {
    version,
    release,
    maxPolls,
    npmRetries,
    pollMs,
    npmRetryMs,
  });
  return reportReleaseVerificationStart({
    execFile,
    repo,
    headSha,
    tag,
    pollMs,
    maxPolls,
    sleep,
    log,
    checkPublish: publication.workflows.length > 0,
    publicationWorkflows: publication.workflows,
  });
}
