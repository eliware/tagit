import { pollReleaseCi } from "../../release/ci/status.mjs";
import { verifyReleaseCi } from "./ci.mjs";
import { verifyPublicationJobs } from "../../release/publication/jobs.mjs";
import { selectReleasePublicationTargets } from "../../release/publication/targets.mjs";
import { verifyPublicationRegistries } from "../../release/publication/registries.mjs";

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
  const npmTarget = verifyReleaseCi(fs, log, repo, tag, run, runnerLabelsByJobName);
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
  const { targets, ghcrApplicable } = selectReleasePublicationTargets(fs, npmTarget);
  verifyPublicationJobs({
    targets,
    publicationRuns,
    applicable: npmTarget.applicable,
    isPrivate: npmTarget.isPrivate,
    repo,
    tag,
    log,
  });
  if (!npmTarget.applicable && !ghcrApplicable)
    return { repo, tag, headSha, ci: true, npm: false, ghcr: false };
  return verifyPublicationRegistries({
    fs,
    execFile,
    log,
    repo,
    tag,
    headSha,
    version,
    release,
    applicable: npmTarget.applicable,
    packageName: npmTarget.packageName,
    isPrivate: npmTarget.isPrivate,
    ghcrApplicable,
    maxPolls,
    npmRetries,
    pollMs,
    npmRetryMs,
    sleep,
  });
}
