import { readPublicationTarget } from "../../../src/commands/release-wait/read-publication-target.mjs";

test("reads an explicit npm profile when its publish workflow exists", () => {
  const fs = {
    existsSync: () => true,
    readFileSync: () =>
      JSON.stringify({ name: "demo", private: false, eliware: { apply: ["npm-published"] } }),
  };
  expect(readPublicationTarget(fs)).toEqual({
    applicable: true,
    publishWorkflow: true,
    packageName: "demo",
    isPrivate: false,
  });
});

test("returns no npm target when package metadata is absent", () => {
  expect(readPublicationTarget({ existsSync: () => false })).toEqual({
    applicable: false,
    publishWorkflow: false,
    packageName: null,
    isPrivate: null,
  });
});
test("skips npm publication checks for a GHCR-only profile", () => {
  expect(
    readPublicationTarget({
      existsSync: (file) => file === "package.json" || file === ".github/workflows/publish.yaml",
      readFileSync: () =>
        JSON.stringify({ name: "demo", eliware: { apply: ["general", "ghcr-published"] } }),
    }),
  ).toEqual({ applicable: false, publishWorkflow: true, packageName: null, isPrivate: false });
});
test("does not require npm metadata for a non-publishing private package", () => {
  expect(
    readPublicationTarget({
      existsSync: (file) => file === "package.json",
      readFileSync: () => JSON.stringify({ private: true }),
    }),
  ).toEqual({ applicable: false, publishWorkflow: false, packageName: null, isPrivate: true });
});
test("rejects malformed publication names", () => {
  expect(() =>
    readPublicationTarget({
      existsSync: () => true,
      readFileSync: () => JSON.stringify({ name: 42, eliware: { apply: ["npm-published"] } }),
    }),
  ).toThrow("must declare a name");
  expect(() =>
    readPublicationTarget({
      existsSync: () => true,
      readFileSync: () =>
        JSON.stringify({ name: "not valid", eliware: { apply: ["npm-published"] } }),
    }),
  ).toThrow("invalid for publication");
});
test("rejects a public package without a name", () => {
  expect(() =>
    readPublicationTarget({
      existsSync: () => true,
      readFileSync: () => JSON.stringify({ private: false, eliware: { apply: ["npm-published"] } }),
    }),
  ).toThrow("must declare a name");
});
