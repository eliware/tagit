export function validateReleaseRunRecords(runs, tag) {
  if (!Array.isArray(runs))
    throw new Error(`Release CI data is malformed for ${tag}: run list is not an array.`);
  if (
    runs.some(
      (item) =>
        !item ||
        typeof item !== "object" ||
        !Number.isInteger(item.databaseId) ||
        typeof item.headSha !== "string" ||
        typeof item.headBranch !== "string",
    )
  )
    throw new Error(`Release CI data is malformed for ${tag}: run identity is incomplete.`);
  if (
    runs.some(
      (item) =>
        item.createdAt !== undefined && !Number.isFinite(new Date(item.createdAt).getTime()),
    )
  )
    throw new Error(`Release CI data is malformed for ${tag}: creation timestamp is invalid.`);
  return runs;
}
