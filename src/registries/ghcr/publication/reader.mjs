export function readGhcrPublication(fs) {
  if (!fs.existsSync("package.json")) return null;
  return JSON.parse(fs.readFileSync("package.json", "utf8"));
}
