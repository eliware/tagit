export function selectReleaseRun(runs, headSha, tag) {
  if (!Array.isArray(runs)) throw new Error(`Release CI evidence is malformed for ${tag}: run list is not an array.`);
  if (runs.some(item => !item || typeof item !== 'object' || !Number.isInteger(item.databaseId) || typeof item.headSha !== 'string' || typeof item.headBranch !== 'string')) throw new Error(`Release CI evidence is malformed for ${tag}: run identity is incomplete.`);
  if (runs.some(item => item.createdAt !== undefined && !Number.isFinite(new Date(item.createdAt).getTime()))) throw new Error(`Release CI evidence is malformed for ${tag}: creation timestamp is invalid.`);
  const eligible = runs
    .filter(item => item.headSha === headSha && [tag, `refs/tags/${tag}`].includes(item.headBranch))
    .sort((a, b) => {
      const createdDifference = new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
      return Number.isFinite(createdDifference) && createdDifference !== 0 ? createdDifference : Number(b.databaseId) - Number(a.databaseId);
    });
  if (eligible.length > 1 && eligible.some(item => !item.createdAt) && eligible.some(item => item.createdAt)) throw new Error(`Release CI evidence is ambiguous because eligible runs are missing creation timestamps for ${tag}.`);
  return eligible[0];
}
