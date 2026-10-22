import { hasGhcrPublicationProfile } from "./publication/policy.mjs";
import { readGhcrPublication } from "./publication/reader.mjs";

export function publishesGhcr(fs) {
  const packageData = readGhcrPublication(fs);
  return packageData !== null && hasGhcrPublicationProfile(packageData);
}
