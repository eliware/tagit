import verifyRegistries from "../../verify/registries.mjs";

export default async function verifyPublicationRegistries(options) {
  const { repo, tag, headSha } = options;
  const registries = await verifyRegistries(options);
  return { repo, tag, headSha, ci: true, ...registries };
}
