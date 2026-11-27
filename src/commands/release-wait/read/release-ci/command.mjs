export default function createReleaseCiListArgs(repo, headSha, workflowPath) {
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
