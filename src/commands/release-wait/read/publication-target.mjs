import { publishesGhcr } from "../../../registries/ghcr/discover-publication.mjs";
import { readPackageData } from "./package-data.mjs";
import { readNpmPublicationTarget } from "./npm-target.mjs";
import { buildPublicationWorkflowTargets } from "./workflow-targets.mjs";

export function readPublicationTarget(fs) {
  const packageData = readPackageData(fs);
  if (packageData === null)
    return {
      applicable: false,
      ghcrApplicable: false,
      workflows: [],
      packageName: null,
      isPrivate: null,
    };
  const npmTarget = readNpmPublicationTarget(fs, packageData);
  const ghcrApplicable = publishesGhcr(fs, packageData);
  return {
    applicable: npmTarget.applicable,
    ghcrApplicable,
    workflows: buildPublicationWorkflowTargets(npmTarget.workflow, ghcrApplicable),
    packageName: npmTarget.packageName,
    isPrivate: Boolean(packageData.private),
  };
}
