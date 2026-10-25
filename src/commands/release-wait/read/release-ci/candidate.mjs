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
  let runs;
  try {
    runs = await readReleaseCiJson(execFile, createReleaseCiListArgs(repo, headSha, workflowPath));
  } catch (error) {
    if (error instanceof SyntaxError) error.code = "ERR_RELEASE_CI_LIST_JSON";
    throw error;
  }
  return selectReleaseRun(runs, headSha, tag, workflowPath);
}
