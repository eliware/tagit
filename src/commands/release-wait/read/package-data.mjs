export function readPackageData(fs) {
  if (!fs.existsSync("package.json")) return null;
  return JSON.parse(fs.readFileSync("package.json", "utf8"));
}
