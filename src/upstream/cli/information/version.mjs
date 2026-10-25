export function showUpstreamVersion(readFileSync, packageJsonUrl, log) {
  const packageJson = JSON.parse(readFileSync(packageJsonUrl, "utf8"));
  log.log(packageJson.version);
}
