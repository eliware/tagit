import selectRegistryPolicy from "./registry/policy.mjs";
import verifyRegistryChecks from "./registry/checks.mjs";

export default async function verifyRegistries(options) {
  return verifyRegistryChecks(selectRegistryPolicy(options));
}
