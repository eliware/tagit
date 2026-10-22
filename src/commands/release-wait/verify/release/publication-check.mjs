import { readPublicationTarget } from "../../read/publication-target.mjs";
import { verifyReleasePublication } from "./publication.mjs";

export async function checkReleasePublication({
  fs,
  poll,
  common,
  publicationWorkflows,
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
  for (const workflow of publicationWorkflows) {
    const run = await poll({
      ...common,
      workflowPath: workflow.workflowPath,
      workflowLabel: workflow.profile,
    });
    publicationRuns.push({ ...workflow, run });
  }
  const npmTarget = readPublicationTarget(fs);
  return verifyReleasePublication({
    fs,
    execFile,
    log,
    repo,
    tag,
    headSha,
    version,
    release,
    npmTarget,
    publicationRuns,
    maxPolls,
    npmRetries,
    pollMs,
    npmRetryMs,
    sleep,
  });
}
