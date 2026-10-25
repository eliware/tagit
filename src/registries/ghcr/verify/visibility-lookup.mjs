import { execFileCommand } from "../../../process/async/exec-file-command.mjs";
import { parseGhcrVersionsResponse } from "../parse/versions-response.mjs";

export async function lookupGhcrVisibleImage(execFile, { owner, imageName, version }) {
  const packagePath = `/orgs/${encodeURIComponent(owner)}/packages/container/${encodeURIComponent(imageName)}/versions`;
  let output;
  try {
    output = await execFileCommand(execFile, "gh", ["api", "--paginate", "--slurp", packagePath]);
  } catch (error) {
    const details = `${error.stderr}\n${error.message}`;
    if (!/\b404\b/.test(details)) throw error;
    const userPackagePath = [
      "",
      "users",
      encodeURIComponent(owner),
      "packages",
      "container",
      encodeURIComponent(imageName),
      "versions",
    ].join("/");
    output = await execFileCommand(execFile, "gh", [
      "api",
      "--paginate",
      "--slurp",
      userPackagePath,
    ]);
  }
  return parseGhcrVersionsResponse(output, version);
}
