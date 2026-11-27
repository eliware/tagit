import selectReleaseRunBranches from "../../../../github/runs/release/run/branch-policy.mjs";

export default function validateReleaseRunIdentity(details, candidate, headSha, tag) {
  if (details.databaseId !== undefined && details.databaseId !== candidate.databaseId)
    throw new Error(
      `Release CI details identify run ${details.databaseId}, expected ${candidate.databaseId}.`,
    );
  if (details.headSha !== headSha)
    throw new Error(`Release CI details have commit ${details.headSha}, expected ${headSha}.`);
  if (!selectReleaseRunBranches(tag).includes(candidate.headBranch))
    throw new Error(
      `Release CI candidate uses branch ${candidate.headBranch}, which is not valid for release tag ${tag}.`,
    );
  return details;
}
