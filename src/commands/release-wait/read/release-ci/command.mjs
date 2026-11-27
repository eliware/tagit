export default function buildReleaseCiArgs(
  repo,
  { action, headSha, tag, workflowPath, databaseId },
) {
  if (action === "view")
    return [
      "run",
      "view",
      String(databaseId),
      "--repo",
      repo,
      "--json",
      "databaseId,status,conclusion,headSha,jobs,url",
    ];
  return [
    "run",
    "list",
    "--repo",
    repo,
    "--commit",
    headSha,
    "--branch",
    tag,
    "--workflow",
    workflowPath,
    "--limit",
    "1000",
    "--json",
    "databaseId,createdAt,headSha,headBranch",
  ];
}
