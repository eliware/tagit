import verifyReleasePublicationRegistries from "./publication/registries.mjs";
import verifyReleasePublicationWorkflowPlan from "./publication/workflow-plan.mjs";

export default async function verifyReleasePublication({
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
}) {
  const { ghcrApplicable, applicable: publicationApplies } = verifyReleasePublicationWorkflowPlan({
    publication,
    publicationRuns,
    repo,
    tag,
    log,
  });
  return verifyReleasePublicationRegistries(
    {
      fs,
      execFile,
      log,
      repo,
      tag,
      headSha,
      version,
      release,
      publication,
      maxPolls,
      npmRetries,
      pollMs,
      npmRetryMs,
      sleep,
    },
    { applicable: publicationApplies, ghcrApplicable },
  );
}
