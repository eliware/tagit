export default function selectLatestRun(runs, headSha) {
  return runs
    .filter((run) => run.headSha === headSha)
    .sort((a, b) => Number(b.databaseId) - Number(a.databaseId))[0];
}
