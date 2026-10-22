import { validateReleaseRunRecords } from "./records.mjs";

export function selectReleaseRun(runs, headSha, tag, workflowPath = ".github/workflows/ci.yaml") {
  validateReleaseRunRecords(runs, tag);
  const branches = [".github/workflows/npm.yaml", ".github/workflows/ghcr.yaml"].includes(
    workflowPath,
  )
    ? [tag, `refs/tags/${tag}`]
    : ["main", tag, `refs/tags/${tag}`];
  const eligible = runs
    .filter((item) => item.headSha === headSha && branches.includes(item.headBranch))
    .sort((a, b) => {
      const createdDifference =
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
      return Number.isFinite(createdDifference) && createdDifference !== 0
        ? createdDifference
        : Number(b.databaseId) - Number(a.databaseId);
    });
  if (
    eligible.length > 1 &&
    eligible.some((item) => !item.createdAt) &&
    eligible.some((item) => item.createdAt)
  )
    throw new Error(
      `Release CI data is ambiguous because eligible runs do not have creation timestamps for ${tag}.`,
    );
  return eligible[0];
}
