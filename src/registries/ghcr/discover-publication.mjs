import { hasGhcrPublicationProfile } from "./publication/policy.mjs";
import { readGhcrPublication } from "./publication/reader.mjs";
import { hasGhcrPublicationWorkflow } from "./publication/workflow-policy.mjs";

export function publishesGhcr(fs) {
  const packageData = readGhcrPublication(fs);
  return (
    packageData !== null && hasGhcrPublicationWorkflow(fs) && hasGhcrPublicationProfile(packageData)
  );
}
