import { readReleaseCiJson } from "./json.mjs";
import { createReleaseCiViewArgs } from "./command.mjs";

export function readReleaseCiDetails(execFile, repo, databaseId) {
  return readReleaseCiJson(execFile, createReleaseCiViewArgs(repo, databaseId));
}
