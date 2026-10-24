export function validateReleaseRunIdentity(details, candidate, headSha) {
  if (details.databaseId !== undefined && details.databaseId !== candidate.databaseId)
    throw new Error(
      `Release CI details identify run ${details.databaseId}, expected ${candidate.databaseId}.`,
    );
  if (details.headSha !== headSha)
    throw new Error(`Release CI details have commit ${details.headSha}, expected ${headSha}.`);
  return details;
}
