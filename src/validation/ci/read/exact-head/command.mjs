export function buildExactHeadRunCommand(headSha, repository, selectedRun) {
  const repoArg = repository ? ["--repo", repository] : [];
  const args = selectedRun
    ? [
        "run",
        "view",
        String(selectedRun.databaseId),
        ...repoArg,
        "--json",
        "databaseId,status,conclusion,headSha,url",
      ]
    : [
        "run",
        "list",
        "--commit",
        headSha,
        ...repoArg,
        "--limit",
        "1000",
        "--json",
        "databaseId,status,conclusion,headSha,url",
      ];
  return { repoArg, args };
}
