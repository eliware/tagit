import { readPackageName } from "../../../registries/npm/read-package-name.mjs";

export function readPublicationTarget(fs) {
  if (!fs.existsSync("package.json"))
    return {
      applicable: false,
      ghcrApplicable: false,
      workflows: [],
      packageName: null,
      isPrivate: null,
    };
  const packageData = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const profiles = packageData?.eliware?.apply;
  const npmWorkflow = fs.existsSync(".github/workflows/npm.yaml");
  const ghcrWorkflow = fs.existsSync(".github/workflows/ghcr.yaml");
  const npmApplicable =
    npmWorkflow && Array.isArray(profiles) && profiles.includes("npm-published");
  const ghcrApplicable =
    ghcrWorkflow && Array.isArray(profiles) && profiles.includes("ghcr-published");
  const workflows = [];
  if (npmApplicable) workflows.push({ workflowPath: ".github/workflows/npm.yaml", profile: "npm" });
  if (ghcrApplicable)
    workflows.push({ workflowPath: ".github/workflows/ghcr.yaml", profile: "ghcr" });
  const packageName = npmApplicable ? readPackageName(fs) : null;
  if (npmApplicable && !packageName && !packageData.private)
    throw new Error("Public package.json must declare a name for npm publication verification.");
  if (npmApplicable && packageName && !/^(@[a-z0-9._-]+\/)?[a-z0-9._-]+$/i.test(packageName))
    throw new Error("package.json name is invalid for publication verification.");
  return {
    applicable: npmApplicable,
    ghcrApplicable,
    workflows,
    packageName,
    isPrivate: Boolean(packageData.private),
  };
}
