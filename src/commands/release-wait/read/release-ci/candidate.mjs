import { selectReleaseRun } from "../../../../github/runs/release/run/selection.mjs";
import { readReleaseCiJson } from "./json.mjs";
import { createReleaseCiListArgs } from "./command.mjs";

export async function readReleaseCiCandidate(
  execFile,
  repo,
  headSha,
  tag,
  workflowPath = ".github/workflows/ci.yaml",
) {
  const runs = await readReleaseCiJson(
    execFile,
    createReleaseCiListArgs(repo, headSha, workflowPath),
  );
  return selectReleaseRun(runs, headSha, tag, workflowPath);
}
