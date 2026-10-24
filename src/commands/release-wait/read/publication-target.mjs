import { publishesGhcr } from "../../../registries/ghcr/discover-publication.mjs";
import { readNpmPublicationTarget } from "./npm-target.mjs";

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
  const npmTarget = readNpmPublicationTarget(fs, packageData);
  const ghcrApplicable = publishesGhcr(fs);
  const workflows = [];
  if (npmTarget.applicable)
    workflows.push({ workflowPath: ".github/workflows/npm.yaml", profile: "npm" });
  if (ghcrApplicable)
    workflows.push({ workflowPath: ".github/workflows/ghcr.yaml", profile: "ghcr" });
  return {
    applicable: npmTarget.applicable,
    ghcrApplicable,
    workflows,
    packageName: npmTarget.packageName,
    isPrivate: Boolean(packageData.private),
  };
}
