import selectReleasePublicationTargets from "../../../release/publication/targets.mjs";

export default function buildReleasePublicationPlan(publication) {
  const selection = selectReleasePublicationTargets(publication);
  return {
    ...selection,
    applicable: publication.applicable || selection.ghcrApplicable,
  };
}
