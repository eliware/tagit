export function mergeReleaseRun(candidate, details) {
  return {
    ...candidate,
    ...details,
    databaseId: candidate.databaseId,
    headSha: details.headSha,
    headBranch: candidate.headBranch,
  };
}
