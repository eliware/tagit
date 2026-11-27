import execFileCommand from "../../../../process/async/exec-file-command.mjs";
import resolvePersonalGhcrVersionsPath from "./fallback.mjs";

export default async function readGhcrVersionsOutput(execFile, owner, imageName) {
  const organizationPath = `/orgs/${encodeURIComponent(owner)}/packages/container/${encodeURIComponent(imageName)}/versions`;
  try {
    return await execFileCommand(execFile, "gh", [
      "api",
      "--paginate",
      "--slurp",
      organizationPath,
    ]);
  } catch (error) {
    const personalPath = resolvePersonalGhcrVersionsPath(owner, imageName, error);
    return execFileCommand(execFile, "gh", ["api", "--paginate", "--slurp", personalPath]);
  }
}
