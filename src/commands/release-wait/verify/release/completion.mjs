import { pollReleaseCi } from "../../release/ci/status.mjs";
import { verifyReleaseCi } from "./ci.mjs";
import { readPublicationTarget } from "../../read/publication-target.mjs";
import { verifyReleasePublication } from "./publication.mjs";

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
  publicationWorkflows = [],
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
  verifyReleaseCi(log, repo, tag, run, runnerLabelsByJobName);
  if (!checkPublish) return { repo, tag, headSha, ci: true, npm: false, ghcr: false };
  const publicationRuns = [];
  for (const workflow of publicationWorkflows) {
    const publicationRun = await poll({
      ...common,
      workflowPath: workflow.workflowPath,
      workflowLabel: workflow.profile,
    });
    publicationRuns.push({ ...workflow, run: publicationRun });
  }
  const publicationTarget = readPublicationTarget(fs);
  return verifyReleasePublication({
    fs,
    execFile,
    log,
    repo,
    tag,
    headSha,
    version,
    release,
    npmTarget: publicationTarget,
    publicationRuns,
    maxPolls,
    npmRetries,
    pollMs,
    npmRetryMs,
    sleep,
  });
}
