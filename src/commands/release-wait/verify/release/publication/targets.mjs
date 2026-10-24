import { selectReleasePublicationTargets } from "../../../release/publication/targets.mjs";

export function buildReleasePublicationPlan(fs, npmTarget) {
  const selection = selectReleasePublicationTargets(fs, npmTarget);
  return {
    ...selection,
    applicable: npmTarget.applicable || selection.ghcrApplicable,
  };
}
