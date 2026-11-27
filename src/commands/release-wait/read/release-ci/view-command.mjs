export default function createReleaseCiViewArgs(repo, databaseId) {
  return [
    "run",
    "view",
    String(databaseId),
    "--repo",
    repo,
    "--json",
    "databaseId,status,conclusion,headSha,jobs,url",
  ];
}
