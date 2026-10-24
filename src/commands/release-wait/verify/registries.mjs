import { selectRegistryPolicy } from "./registry/policy.mjs";
import { verifyRegistryChecks } from "./registry/checks.mjs";

export async function verifyRegistries(options) {
  const { fs, log, applicable, packageName, isPrivate, ghcrApplicable } = options;
  const policy = selectRegistryPolicy(
    fs,
    log,
    { applicable, packageName, isPrivate },
    ghcrApplicable,
  );
  return verifyRegistryChecks({ ...options, ...policy });
}
