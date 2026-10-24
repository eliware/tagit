import { publishesGhcr } from "../../../registries/ghcr/discover-publication.mjs";
import { readNpmPublicationTarget } from "./npm-target.mjs";
import { buildPublicationWorkflowTargets } from "./workflow-targets.mjs";

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
  return {
    applicable: npmTarget.applicable,
    ghcrApplicable,
    workflows: buildPublicationWorkflowTargets(npmTarget.applicable, ghcrApplicable),
    packageName: npmTarget.packageName,
    isPrivate: Boolean(packageData.private),
  };
}
