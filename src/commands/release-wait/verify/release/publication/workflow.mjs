import { verifyReleasePublicationJobs } from "./jobs.mjs";
import { reportReleasePublicationLinks } from "./links.mjs";

export function verifyReleasePublicationWorkflow(options) {
  const verifiedPublications = verifyReleasePublicationJobs(options);
  reportReleasePublicationLinks(options.log, verifiedPublications);
  return verifiedPublications;
}
