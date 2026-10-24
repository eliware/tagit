import { buildReleasePublicationPlan } from "../../../../../../src/commands/release-wait/verify/release/publication/targets.mjs";

test("returns an empty plan when publication does not apply", () => {
  expect(
    buildReleasePublicationPlan(
      { existsSync: () => false },
      { applicable: false, packageName: null, isPrivate: null },
    ),
  ).toEqual({ targets: [], ghcrApplicable: false, applicable: false });
});

test("marks an npm target as applicable", () => {
  expect(
    buildReleasePublicationPlan(
      { existsSync: () => false },
      { applicable: true, packageName: "demo", isPrivate: false },
    ),
  ).toEqual({
    targets: [{ profile: "npm", packageName: "demo", isPrivate: false }],
    ghcrApplicable: false,
    applicable: true,
  });
});

test("marks a GHCR-only publication target as applicable", () => {
  const fs = {
    existsSync: (file) => file === "package.json" || file === ".github/workflows/ghcr.yaml",
    readFileSync: () => JSON.stringify({ eliware: { apply: ["ghcr-published"] } }),
  };
  expect(
    buildReleasePublicationPlan(fs, {
      applicable: false,
      packageName: null,
      isPrivate: false,
    }),
  ).toEqual({
    targets: [{ profile: "ghcr", packageName: "image", isPrivate: false }],
    ghcrApplicable: true,
    applicable: true,
  });
});
