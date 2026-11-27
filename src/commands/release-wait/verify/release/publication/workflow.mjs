import verifyPublicationJobs from "../../../release/publication/jobs.mjs";
import reportReleasePublicationLinks from "./links.mjs";

export default function verifyReleasePublicationWorkflow(options) {
  const verifiedPublications = verifyPublicationJobs(options);
  reportReleasePublicationLinks(options.log, verifiedPublications);
  return verifiedPublications;
}
