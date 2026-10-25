import { hasGhcrPublicationProfile } from "./publication/policy.mjs";
import { readGhcrPublication } from "./publication/reader.mjs";
import { hasGhcrPublicationWorkflow } from "./publication/workflow-policy.mjs";

export function publishesGhcr(fs, providedPackageData = undefined) {
  const packageData =
    providedPackageData === undefined ? readGhcrPublication(fs) : providedPackageData;
  return (
    packageData !== null && hasGhcrPublicationWorkflow(fs) && hasGhcrPublicationProfile(packageData)
  );
}
