export function selectReleasePublicationTargets(publication) {
  const ghcrApplicable = publication.ghcrApplicable;
  const targets = [
    ...(publication.applicable
      ? [
          {
            profile: "npm",
            packageName: publication.packageName,
            isPrivate: publication.isPrivate,
          },
        ]
      : []),
    ...(ghcrApplicable ? [{ profile: "ghcr", packageName: "image", isPrivate: false }] : []),
  ];
  return { targets, ghcrApplicable };
}
