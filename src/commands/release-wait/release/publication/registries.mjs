import verifyRegistries from "../../verify/registries.mjs";
import createRegistryResult from "../../verify/registry/result.mjs";

export default async function verifyPublicationRegistries(options) {
  const registries = await verifyRegistries(options);
  return createRegistryResult(options, registries);
}
