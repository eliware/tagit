import { isReleaseVersion } from "../../../versioning/is-release-version.mjs";

export function validateNpmViewCommandInputs(packageName, version) {
  if (!/^(?:@[a-z0-9._-]+\/)?[a-z0-9._-]+$/i.test(packageName ?? ""))
    throw new Error("Package name is invalid for npm publication verification.");
  if (!isReleaseVersion(version))
    throw new Error("Version is invalid for npm publication verification.");
}
