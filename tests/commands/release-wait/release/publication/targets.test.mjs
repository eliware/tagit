import { selectReleasePublicationTargets } from "../../../../../src/commands/release-wait/release/publication/targets.mjs";

test("selects applicable npm and GHCR publication targets", () => {
  expect(
    selectReleasePublicationTargets({
      applicable: true,
      ghcrApplicable: true,
      packageName: "demo",
      isPrivate: false,
    }),
  ).toEqual({
    targets: [
      { profile: "npm", packageName: "demo", isPrivate: false },
      { profile: "ghcr", packageName: "image", isPrivate: false },
    ],
    ghcrApplicable: true,
  });
});

test("selects no publication targets when no publication applies", () => {
  expect(
    selectReleasePublicationTargets({
      applicable: false,
      ghcrApplicable: false,
      packageName: null,
      isPrivate: true,
    }),
  ).toEqual({ targets: [], ghcrApplicable: false });
});
