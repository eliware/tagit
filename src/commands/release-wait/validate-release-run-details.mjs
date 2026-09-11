import { validateJobRecords } from '../../validation/ci/validate-job-records.mjs';

export function validateReleaseRunDetails(details, candidate, headSha) {
  if (
    !details ||
    (details.databaseId !== undefined && typeof details.databaseId !== 'number') ||
    typeof details.status !== 'string' ||
    (details.conclusion !== null && details.conclusion !== undefined && typeof details.conclusion !== 'string') ||
    typeof details.headSha !== 'string' ||
    !Array.isArray(details.jobs)
  )
    throw new Error(`Release CI returned malformed details for run ${candidate.databaseId}.`);
  if (details.databaseId !== undefined && details.databaseId !== candidate.databaseId)
    throw new Error(`Release CI details identify run ${details.databaseId}, expected ${candidate.databaseId}.`);
  validateJobRecords(details.jobs, candidate.databaseId);
  if (details.headSha !== headSha)
    throw new Error(`Release CI details have commit ${details.headSha}, expected ${headSha}.`);
  return details;
}
