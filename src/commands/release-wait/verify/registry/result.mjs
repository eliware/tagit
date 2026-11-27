export default function createRegistryResult(options, registries) {
  const { repo, tag, headSha } = options;
  return { repo, tag, headSha, ci: true, ...registries };
}
