import { buildReleasePublicationPlan } from "../../../../../../src/commands/release-wait/verify/release/publication/plan.mjs";

test("returns an empty plan when publication does not apply", () => {
  expect(
    buildReleasePublicationPlan({
      applicable: false,
      ghcrApplicable: false,
      packageName: null,
      isPrivate: null,
    }),
  ).toEqual({ targets: [], ghcrApplicable: false, applicable: false });
});

test("marks an npm target as applicable", () => {
  expect(
    buildReleasePublicationPlan({
      applicable: true,
      ghcrApplicable: false,
      packageName: "demo",
      isPrivate: false,
    }),
  ).toEqual({
    targets: [{ profile: "npm", packageName: "demo", isPrivate: false }],
    ghcrApplicable: false,
    applicable: true,
  });
});

test("marks a GHCR-only publication target as applicable", () => {
  expect(
    buildReleasePublicationPlan({
      applicable: false,
      ghcrApplicable: true,
      packageName: null,
      isPrivate: false,
    }),
  ).toEqual({
    targets: [{ profile: "ghcr", packageName: "image", isPrivate: false }],
    ghcrApplicable: true,
    applicable: true,
  });
});
