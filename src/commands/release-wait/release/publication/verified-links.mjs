import { reportPublicationJobLinks } from "./job-links.mjs";

export function reportVerifiedPublicationJobLinks(log, publications) {
  for (const { profile, publishJobs } of publications)
    reportPublicationJobLinks(log, profile, publishJobs);
}
