import { verifyReleasePublicationWorkflow } from "./publication/workflow.mjs";
import { verifyReleasePublicationRegistries } from "./publication/registries.mjs";
import { buildReleasePublicationPlan } from "./publication/plan.mjs";

export async function verifyReleasePublication({
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
  const {
    targets,
    ghcrApplicable,
    applicable: publicationApplies,
  } = buildReleasePublicationPlan(publication);
  verifyReleasePublicationWorkflow({
    targets,
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
