export function selectReleaseRun(runs, headSha, tag) {
  const eligible = runs
    .filter(item => item.headSha === headSha && [tag, `refs/tags/${tag}`].includes(item.headBranch))
    .sort((a, b) => Number(b.databaseId) - Number(a.databaseId));
  if (eligible.length > 1 && eligible.some(item => !item.createdAt || !Number.isFinite(new Date(item.createdAt).getTime()) || !Number.isFinite(Number(item.databaseId)))) {
    throw new Error(`Release CI evidence is ambiguous for ${tag}: candidate metadata is incomplete.`);
  }
  return eligible[0];
}
