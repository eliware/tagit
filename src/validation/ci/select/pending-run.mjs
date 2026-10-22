export function selectPendingRun(runs, headSha) {
  return (
    runs
      .filter((run) => run.headSha === headSha)
      .sort((left, right) => Number(right.databaseId) - Number(left.databaseId))
      .find((run) => run.status !== "completed") ?? null
  );
}
