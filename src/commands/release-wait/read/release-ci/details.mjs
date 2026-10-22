import { readReleaseCiJson } from "./json.mjs";

export function readReleaseCiDetails(execFile, repo, databaseId) {
  return readReleaseCiJson(execFile, [
    "run",
    "view",
    String(databaseId),
    "--repo",
    repo,
    "--json",
    "databaseId,status,conclusion,headSha,jobs,url",
  ]);
}
