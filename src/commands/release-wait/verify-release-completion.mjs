import { pollReleaseCi } from "./release-ci-status.mjs";
import { verifyReleaseCi } from "./verify-release-ci.mjs";
import { verifyReleasePublication } from "./release-publication-status.mjs";

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
  maxPolls,
  npmRetries,
  pollMs,
  npmRetryMs,
  sleep,
  poll = pollReleaseCi,
}) {
  const common = { execFile, repo, headSha, tag, pollMs, maxPolls, sleep, linksOnly: false, log };
  const run = await poll({
    ...common,
    workflowPath: ".github/workflows/ci.yaml",
    workflowLabel: "CI",
  });
  const verifiedTarget = verifyReleaseCi(fs, log, repo, tag, run, runnerLabelsByJobName);
  if (!checkPublish) return { repo, tag, headSha, ci: true, npm: false, ghcr: false };
  const publishRun = await poll({
    ...common,
    workflowPath: ".github/workflows/publish.yaml",
    workflowLabel: "publish",
  });
  return verifyReleasePublication({
    fs,
    runnerLabelsByJobName,
    execFile,
    log,
    repo,
    tag,
    headSha,
    version,
    run,
    publishRun,
    verifiedTarget,
    release,
    maxPolls,
    npmRetries,
    pollMs,
    npmRetryMs,
    sleep,
  });
}
