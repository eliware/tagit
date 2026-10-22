export function hasGhcrPublicationProfile(packageData) {
  const profiles = packageData?.eliware?.apply;
  return Array.isArray(profiles) && profiles.includes("ghcr-published");
}
