import { readPackageName } from "../../../registries/npm/read-package-name.mjs";
import { validateNpmPublicationName } from "../../../registries/npm/validate/publication-name.mjs";
import { publishesGhcr } from "../../../registries/ghcr/discover-publication.mjs";

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
  const npmApplicable =
    npmWorkflow && Array.isArray(profiles) && profiles.includes("npm-published");
  const ghcrApplicable = publishesGhcr(fs);
  const workflows = [];
  if (npmApplicable) workflows.push({ workflowPath: ".github/workflows/npm.yaml", profile: "npm" });
  if (ghcrApplicable)
    workflows.push({ workflowPath: ".github/workflows/ghcr.yaml", profile: "ghcr" });
  const packageName = npmApplicable
    ? validateNpmPublicationName(readPackageName(fs), Boolean(packageData.private))
    : null;
  return {
    applicable: npmApplicable,
    ghcrApplicable,
    workflows,
    packageName,
    isPrivate: Boolean(packageData.private),
  };
}
