import { publishesGhcr } from "../../../../registries/ghcr/discover-publication.mjs";

export function selectReleasePublicationTargets(fs, npmTarget) {
  const ghcrApplicable = publishesGhcr(fs);
  const targets = [
    ...(npmTarget.applicable
      ? [
          {
            profile: "npm",
            packageName: npmTarget.packageName,
            isPrivate: npmTarget.isPrivate,
          },
        ]
      : []),
    ...(ghcrApplicable ? [{ profile: "ghcr", packageName: "image", isPrivate: false }] : []),
  ];
  return { targets, ghcrApplicable };
}
