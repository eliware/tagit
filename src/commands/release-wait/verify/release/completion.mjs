import { pollReleaseCi } from "../../release/ci/status.mjs";
import { checkReleaseCi } from "./ci/check.mjs";
import { checkReleasePublication } from "./publication-check.mjs";

export async function verifyReleaseCompletion({
  fs,
  runnerLabelsByJobName,
  execFile,
  log,
  repo,
  tag,
  headSha,
  version,
  release,
  checkPublish,
  publication,
  maxPolls,
  npmRetries,
  pollMs,
  npmRetryMs,
  sleep,
  poll = pollReleaseCi,
}) {
  const common = { execFile, repo, headSha, tag, pollMs, maxPolls, sleep, linksOnly: false, log };
  await checkReleaseCi({
    poll,
    common,
    log,
    repo,
    tag,
    runnerLabelsByJobName,
  });
  if (!checkPublish) return { repo, tag, headSha, ci: true, npm: false, ghcr: false };
  return checkReleasePublication({
    fs,
    poll,
    common,
    publication,
    execFile,
    log,
    repo,
    tag,
    headSha,
    version,
    release,
    maxPolls,
    npmRetries,
    pollMs,
    npmRetryMs,
    sleep,
  });
}
