import { verifyPublicationJobs } from "../../../release/publication/jobs.mjs";
import { reportReleasePublicationLinks } from "./links.mjs";

export function verifyReleasePublicationWorkflow(options) {
  const verifiedPublications = verifyPublicationJobs(options);
  reportReleasePublicationLinks(options.log, verifiedPublications);
  return verifiedPublications;
}
