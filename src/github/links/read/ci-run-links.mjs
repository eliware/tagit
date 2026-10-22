import { validateCiRunRecords } from "./validate-ci-run-records.mjs";

export function readCiRuns(execFileSync, repo, headSha) {
  const parsed = JSON.parse(
    execFileSync(
      "gh",
      [
        "run",
        "list",
        "--repo",
        repo,
        "--commit",
        headSha,
        "--limit",
        "20",
        "--json",
        "databaseId,url,headSha",
      ],
      { encoding: "utf8" },
    ),
  );
  return validateCiRunRecords(parsed).filter((run) => run.headSha === headSha);
}
