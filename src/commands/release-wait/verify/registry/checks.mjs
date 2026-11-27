import verifyRegistryNpmCheck from "./npm-check.mjs";
import verifyRegistryGhcrCheck from "./ghcr-check.mjs";

export default async function verifyRegistryChecks(options) {
  const npmResult = await verifyRegistryNpmCheck(options);
  const ghcrResult = await verifyRegistryGhcrCheck(options);
  return { ...npmResult, ...ghcrResult };
}
