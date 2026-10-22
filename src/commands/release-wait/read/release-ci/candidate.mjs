import { selectReleaseRun } from "../../../../github/runs/release/run/selection.mjs";
import { readReleaseCiJson } from "./json.mjs";

export async function readReleaseCiCandidate(
  execFile,
  repo,
  headSha,
  tag,
  workflowPath = ".github/workflows/ci.yaml",
) {
  const runs = await readReleaseCiJson(execFile, [
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
  ]);
  return selectReleaseRun(runs, headSha, tag, workflowPath);
}
