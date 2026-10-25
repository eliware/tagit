import { validateNpmPublicationName } from "../../../registries/npm/validate/publication-name.mjs";

export function readNpmPublicationTarget(fs, packageData) {
  const npmWorkflow = fs.existsSync(".github/workflows/npm.yaml");
  const profiles = packageData?.eliware?.apply;
  const applicable = npmWorkflow && Array.isArray(profiles) && profiles.includes("npm-published");
  const workflow = applicable
    ? { workflowPath: ".github/workflows/npm.yaml", profile: "npm" }
    : null;
  const packageName = applicable
    ? validateNpmPublicationName(
        typeof packageData?.name === "string" ? packageData.name : null,
        Boolean(packageData.private),
      )
    : null;
  return { applicable, packageName, workflow };
}
