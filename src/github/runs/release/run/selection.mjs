import { validateReleaseRunRecords } from "./records.mjs";
import { selectReleaseRunBranches } from "./branch-policy.mjs";
import { assertUnambiguousReleaseRunTimestamps } from "./ambiguity-policy.mjs";

export function selectReleaseRun(runs, headSha, tag, workflowPath = ".github/workflows/ci.yaml") {
  validateReleaseRunRecords(runs, tag);
  const branches = selectReleaseRunBranches(tag, workflowPath);
  const eligible = runs
    .filter((item) => item.headSha === headSha && branches.includes(item.headBranch))
    .sort((a, b) => {
      const createdDifference =
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
      return Number.isFinite(createdDifference) && createdDifference !== 0
        ? createdDifference
        : Number(b.databaseId) - Number(a.databaseId);
    });
  assertUnambiguousReleaseRunTimestamps(eligible, tag);
  return eligible[0];
}
