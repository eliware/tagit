import readReleaseCiJson from "./json.mjs";
import buildReleaseCiArgs from "./command.mjs";

export default function readReleaseCiDetails(execFile, repo, databaseId) {
  return readReleaseCiJson(
    execFile,
    buildReleaseCiArgs(repo, { action: "view", databaseId }),
  ).catch((error) => {
    if (error instanceof SyntaxError) error.code = "ERR_RELEASE_CI_DETAILS_JSON";
    throw error;
  });
}
