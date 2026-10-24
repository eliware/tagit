import { readPackageName } from "../../../registries/npm/read-package-name.mjs";
import { validateNpmPublicationName } from "../../../registries/npm/validate/publication-name.mjs";

export function readNpmPublicationTarget(fs, packageData) {
  const npmWorkflow = fs.existsSync(".github/workflows/npm.yaml");
  const profiles = packageData?.eliware?.apply;
  const applicable = npmWorkflow && Array.isArray(profiles) && profiles.includes("npm-published");
  const packageName = applicable
    ? validateNpmPublicationName(readPackageName(fs), Boolean(packageData.private))
    : null;
  return { applicable, packageName };
}
