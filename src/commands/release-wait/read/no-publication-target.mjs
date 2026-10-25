export function noPublicationTarget() {
  return {
    applicable: false,
    ghcrApplicable: false,
    workflows: [],
    packageName: null,
    isPrivate: null,
  };
}
