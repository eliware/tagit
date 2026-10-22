export function readGhcrPublication(fs) {
  if (!fs.existsSync("package.json") || !fs.existsSync(".github/workflows/ghcr.yaml")) return null;
  return JSON.parse(fs.readFileSync("package.json", "utf8"));
}
