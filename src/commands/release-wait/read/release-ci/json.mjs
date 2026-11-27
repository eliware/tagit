import readGithubJson from "../../../../github/cli/read-json.mjs";

export default function readReleaseCiJson(execFile, args) {
  return readGithubJson(execFile, "gh", args);
}
