import { selectReleasePublicationTargets } from "../../../../../src/commands/release-wait/release/publication/targets.mjs";

const fsWithGhcr = (enabled) => ({
  existsSync: (file) =>
    file === "package.json" || (enabled && file === ".github/workflows/ghcr.yaml"),
  readFileSync: () => JSON.stringify({ eliware: { apply: ["ghcr-published"] } }),
});

test("selects applicable npm and GHCR publication targets", () => {
  expect(
    selectReleasePublicationTargets(fsWithGhcr(true), {
      applicable: true,
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
    selectReleasePublicationTargets(fsWithGhcr(false), {
      applicable: false,
      packageName: null,
      isPrivate: true,
    }),
  ).toEqual({ targets: [], ghcrApplicable: false });
});
