import { readPublicationTarget } from "../../../../src/commands/release-wait/read/publication-target.mjs";

test("reads an explicit npm profile when npm.yaml exists", () => {
  let packageReads = 0;
  const fs = {
    existsSync: () => true,
    readFileSync: () => {
      packageReads += 1;
      return JSON.stringify({
        name: "demo",
        private: false,
        eliware: { apply: ["npm-published"] },
      });
    },
  };
  expect(readPublicationTarget(fs)).toEqual({
    applicable: true,
    ghcrApplicable: false,
    workflows: [{ workflowPath: ".github/workflows/npm.yaml", profile: "npm" }],
    packageName: "demo",
    isPrivate: false,
  });
  expect(packageReads).toBe(1);
});

test("skips an npm profile when npm.yaml is missing", () => {
  expect(
    readPublicationTarget({
      existsSync: (file) => file === "package.json",
      readFileSync: () => JSON.stringify({ name: "demo", eliware: { apply: ["npm-published"] } }),
    }),
  ).toEqual({
    applicable: false,
    ghcrApplicable: false,
    workflows: [],
    packageName: null,
    isPrivate: false,
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

test("returns no publication targets for a general package profile", () => {
  expect(
    readPublicationTarget({
      existsSync: (file) => file === "package.json",
      readFileSync: () => JSON.stringify({ name: "demo", eliware: { apply: ["general"] } }),
    }),
  ).toEqual({
    applicable: false,
    ghcrApplicable: false,
    workflows: [],
    packageName: null,
    isPrivate: false,
  });
});
