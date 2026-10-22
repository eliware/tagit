import { readPublicationTarget } from "../../../../src/commands/release-wait/read/publication-target.mjs";

test("reads an explicit npm profile when npm.yaml exists", () => {
  const fs = {
    existsSync: () => true,
    readFileSync: () =>
      JSON.stringify({ name: "demo", private: false, eliware: { apply: ["npm-published"] } }),
  };
  expect(readPublicationTarget(fs)).toEqual({
    applicable: true,
    ghcrApplicable: false,
    workflows: [{ workflowPath: ".github/workflows/npm.yaml", profile: "npm" }],
    packageName: "demo",
    isPrivate: false,
  });
});

test("returns no npm target when package metadata is absent", () => {
  expect(readPublicationTarget({ existsSync: () => false })).toEqual({
    applicable: false,
    ghcrApplicable: false,
    workflows: [],
    packageName: null,
    isPrivate: null,
  });
});
test("skips npm publication checks for a GHCR-only profile", () => {
  expect(
    readPublicationTarget({
      existsSync: (file) => file === "package.json" || file === ".github/workflows/ghcr.yaml",
      readFileSync: () =>
        JSON.stringify({ name: "demo", eliware: { apply: ["general", "ghcr-published"] } }),
    }),
  ).toEqual({
    applicable: false,
    ghcrApplicable: true,
    workflows: [{ workflowPath: ".github/workflows/ghcr.yaml", profile: "ghcr" }],
    packageName: null,
    isPrivate: false,
  });
});
test("does not require npm metadata for a non-publishing private package", () => {
  expect(
    readPublicationTarget({
      existsSync: (file) => file === "package.json",
      readFileSync: () => JSON.stringify({ private: true }),
    }),
  ).toEqual({
    applicable: false,
    ghcrApplicable: false,
    workflows: [],
    packageName: null,
    isPrivate: true,
  });
});
