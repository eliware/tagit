import { hasInstalledSharedHarness } from "./installed-harness.mjs";

export function validateTestCommand(packageData, fs) {
  if (!packageData.scripts?.test) return "missing";
  const validScript =
    packageData.name === "@eliware/test"
      ? String(packageData.scripts.test).trim() === "node bin/eliware-test.mjs"
      : String(packageData.scripts.test).trim() === "eliware-test";
  return validScript && hasInstalledSharedHarness(fs, packageData) ? "valid" : "invalid";
}
