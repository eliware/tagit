import { selectSuccessfulPublishJobs } from "../../verify/publish/job.mjs";
import { requirePublishJob } from "../../verify/publish/policy.mjs";

export function verifyPublicationJobs({
  targets,
  publicationRuns,
  applicable,
  isPrivate,
  repo,
  tag,
  log,
}) {
  const verifiedPublications = [];
  for (const target of targets) {
    const publication = publicationRuns.find((item) => item.profile === target.profile);
    if (!publication) throw new Error(`Release ${target.profile} workflow did not complete.`);
    if (!Array.isArray(publication.run.jobs))
      throw new Error(`Release ${target.profile} workflow returned malformed job records.`);
    const publishJobs = selectSuccessfulPublishJobs(publication.run.jobs);
    requirePublishJob(publishJobs, {
      applicable: target.profile === "ghcr" || (applicable && !isPrivate),
      packageName: target.packageName,
      isPrivate: target.isPrivate,
    });
    log.info(`Release ${target.profile} workflow verified for ${repo}@${tag}.`);
    verifiedPublications.push({ profile: target.profile, publishJobs });
  }
  return verifiedPublications;
}
