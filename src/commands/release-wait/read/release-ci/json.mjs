import { readGithubJson } from "../../../../github/cli/read-json.mjs";

export function readReleaseCiJson(execFile, args) {
  return readGithubJson(execFile, "gh", args);
}
