import { execFileCommand } from "../../../process/async/exec-file-command.mjs";
import { parseGhcrVersionsResponse } from "../parse/versions-response.mjs";

export async function lookupGhcrVisibleImage(execFile, { owner, imageName, version }) {
  const output = await execFileCommand(execFile, "gh", [
    "api",
    "--paginate",
    "--slurp",
    `/orgs/${encodeURIComponent(owner)}/packages/container/${encodeURIComponent(imageName)}/versions`,
  ]);
  return parseGhcrVersionsResponse(output, version);
}
