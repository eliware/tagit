import { validateJobRecords } from "../../../../validation/ci/validate/job-records.mjs";
import { validateReleaseRunDetailsShape } from "./details-shape.mjs";
import { validateReleaseRunIdentity } from "./identity.mjs";

export function validateReleaseRunDetails(details, candidate, headSha) {
  validateReleaseRunDetailsShape(details, candidate.databaseId);
  validateReleaseRunIdentity(details, candidate, headSha);
  validateJobRecords(details.jobs, candidate.databaseId);
  return details;
}
