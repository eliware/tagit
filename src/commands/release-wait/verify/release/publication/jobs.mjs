import { verifyPublicationJobs } from "../../../release/publication/jobs.mjs";
import { reportVerifiedPublicationJobLinks } from "../../../release/publication/job-links.mjs";

export function verifyReleasePublicationJobs(options) {
  const verifiedPublications = verifyPublicationJobs(options);
  reportVerifiedPublicationJobLinks(options.log, verifiedPublications);
  return verifiedPublications;
}
