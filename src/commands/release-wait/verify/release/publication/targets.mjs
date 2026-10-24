import { selectReleasePublicationTargets } from "../../../release/publication/targets.mjs";

export function buildReleasePublicationPlan(publication) {
  const selection = selectReleasePublicationTargets(publication);
  return {
    ...selection,
    applicable: publication.applicable || selection.ghcrApplicable,
  };
}
