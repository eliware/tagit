export function createReleaseCiListArgs(repo, headSha, workflowPath) {
  return [
    "run",
    "list",
    "--repo",
    repo,
    "--commit",
    headSha,
    "--workflow",
    workflowPath,
    "--limit",
    "1000",
    "--json",
    "databaseId,createdAt,headSha,headBranch",
  ];
}

export function createReleaseCiViewArgs(repo, databaseId) {
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
