import { verifyReleasePublication } from "./publication.mjs";

export async function checkReleasePublication({
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
}) {
  const publicationRuns = [];
  for (const workflow of publication.workflows) {
    const run = await poll({
      ...common,
      workflowPath: workflow.workflowPath,
      workflowLabel: workflow.profile,
    });
    publicationRuns.push({ ...workflow, run });
  }
  return verifyReleasePublication({
    fs,
    execFile,
    log,
    repo,
    tag,
    headSha,
    version,
    release,
    publication,
    publicationRuns,
    maxPolls,
    npmRetries,
    pollMs,
    npmRetryMs,
    sleep,
  });
}
