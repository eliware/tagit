import { validateRunRecords } from "../../validate/run-records.mjs";
import { buildExactHeadRunCommand } from "./command.mjs";

export function readExactHeadRuns(execFileSync, headSha, repository, selectedRun) {
  const { repoArg, args } = buildExactHeadRunCommand(headSha, repository, selectedRun);
  try {
    const parsed = JSON.parse(execFileSync("gh", args, { encoding: "utf8" }));
    return {
      repoArg,
      runs: validateRunRecords(
        selectedRun && !Array.isArray(parsed) ? [{ ...selectedRun, ...parsed }] : parsed,
        headSha,
      ),
    };
  } catch (error) {
    throw new Error(`Cannot inspect GitHub Actions runs for ${headSha}: ${error.message}`, {
      cause: error,
    });
  }
}
