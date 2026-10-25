import { verifyPublicationRegistries } from "../../../release/publication/registries.mjs";

export function verifyReleasePublicationRegistries(options, plan) {
  const { publication, repo, tag, headSha } = options;
  if (!plan.applicable) return { repo, tag, headSha, ci: true, npm: false, ghcr: false };
  return verifyPublicationRegistries({
    ...options,
    applicable: publication.applicable,
    packageName: publication.packageName,
    isPrivate: publication.isPrivate,
    ghcrApplicable: plan.ghcrApplicable,
  });
}
