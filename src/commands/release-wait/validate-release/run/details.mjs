import { validateJobRecords } from "../../../../validation/ci/validate/job-records.mjs";
import { validateReleaseRunIdentity } from "./details-policy.mjs";

export function validateReleaseRunDetails(details, candidate, headSha) {
  validateReleaseRunIdentity(details, candidate, headSha);
  validateJobRecords(details.jobs, candidate.databaseId);
  return details;
}
