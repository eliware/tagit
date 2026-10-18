/** Read the declared publication profile for GHCR. */
export function publishesGhcr(fs) {
  if (!fs.existsSync("package.json") || !fs.existsSync(".github/workflows/ghcr.yaml")) return false;
  const packageData = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const profiles = packageData?.eliware?.apply;
  return Array.isArray(profiles) && profiles.includes("ghcr-published");
}
