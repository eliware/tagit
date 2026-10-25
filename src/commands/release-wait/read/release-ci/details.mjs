import { readReleaseCiJson } from "./json.mjs";
import { createReleaseCiViewArgs } from "./command.mjs";

export function readReleaseCiDetails(execFile, repo, databaseId) {
  return readReleaseCiJson(execFile, createReleaseCiViewArgs(repo, databaseId)).catch((error) => {
    if (error instanceof SyntaxError) error.code = "ERR_RELEASE_CI_DETAILS_JSON";
    throw error;
  });
}
