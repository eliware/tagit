import { hasInstalledSharedHarness } from "./installed-harness.mjs";

export function invokesEliwareTest(script) {
  return /(?:^|\s)(?:node(?:\.exe)?\s+)?(?:[^\s;&|]*[/\\])?eliware-test(?:\.mjs)?(?:\s|$)/i.test(
    String(script),
  );
}

export function validateTestCommand(packageData, fs) {
  if (!packageData.scripts?.test) return "missing";
  const validScript =
    packageData.name === "@eliware/test"
      ? invokesEliwareTest(packageData.scripts.test)
      : String(packageData.scripts.test).trim() === "eliware-test";
  return validScript && hasInstalledSharedHarness(fs, packageData) ? "valid" : "invalid";
}
