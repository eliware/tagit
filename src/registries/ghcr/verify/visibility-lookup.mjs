import execFileCommand from "../../../process/async/exec-file-command.mjs";
import parseGhcrVersionsResponse from "../parse/versions-response.mjs";
import resolvePersonalGhcrVersionsPath from "./endpoint-fallback.mjs";

export default async function lookupGhcrVisibleImage(execFile, { owner, imageName, version }) {
  const packagePath = `/orgs/${encodeURIComponent(owner)}/packages/container/${encodeURIComponent(imageName)}/versions`;
  let output;
  try {
    output = await execFileCommand(execFile, "gh", ["api", "--paginate", "--slurp", packagePath]);
  } catch (error) {
    const userPackagePath = resolvePersonalGhcrVersionsPath(owner, imageName, error);
    output = await execFileCommand(execFile, "gh", [
      "api",
      "--paginate",
      "--slurp",
      userPackagePath,
    ]);
  }
  return parseGhcrVersionsResponse(output, version);
}
