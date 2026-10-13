import { satisfiesDeclaredRange } from "./satisfies-declared-range.mjs";

export function hasInstalledSharedHarness(fs, packageData) {
  if (packageData.name === "@eliware/test" || !packageData.name) return true;
  const declaredRange = packageData.devDependencies?.["@eliware/test"];
  if (!declaredRange) return false;
  const installedPath = "node_modules/@eliware/test/package.json";
  if (!fs.existsSync(installedPath)) return false;
  if (typeof fs.lstatSync !== "function" || fs.lstatSync(installedPath).isSymbolicLink())
    return false;
  if (typeof fs.readFileSync !== "function") return false;
  let installedPackage;
  try {
    installedPackage = JSON.parse(fs.readFileSync(installedPath, "utf8"));
  } catch {
    return false;
  }
  return (
    installedPackage?.name === "@eliware/test" &&
    satisfiesDeclaredRange(installedPackage.version, declaredRange)
  );
}
