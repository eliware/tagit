import { readPackageName } from "../../registries/npm/read-package-name.mjs";

export function readPublicationTarget(fs) {
  if (!fs.existsSync("package.json"))
    return { applicable: false, packageName: null, isPrivate: null };
  const packageData = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const profiles = packageData?.eliware?.apply;
  const npmApplicable = !Array.isArray(profiles) || profiles.includes("npm-published");
  const packageName = readPackageName(fs);
  if (!packageName && !packageData.private)
    throw new Error("Public package.json must declare a name for npm publication verification.");
  if (!packageName) return { applicable: npmApplicable, packageName: null, isPrivate: true };
  if (typeof packageName !== "string" || !/^(@[a-z0-9._-]+\/)?[a-z0-9._-]+$/i.test(packageName))
    throw new Error("package.json name is invalid for publication verification.");
  return { applicable: npmApplicable, packageName, isPrivate: Boolean(packageData.private) };
}
