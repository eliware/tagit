import { jest } from "@jest/globals";
import { readNpmPublicationTarget } from "../../../../src/commands/release-wait/read/npm-target.mjs";

test("uses the parsed package name for an applicable public target", () => {
  const readFileSync = jest.fn();
  const fs = {
    existsSync: (file) => file === ".github/workflows/npm.yaml",
    readFileSync,
  };
  expect(
    readNpmPublicationTarget(fs, {
      name: "@eliware/demo",
      private: false,
      eliware: { apply: ["npm-published"] },
    }),
  ).toEqual({
    applicable: true,
    packageName: "@eliware/demo",
    workflow: { workflowPath: ".github/workflows/npm.yaml", profile: "npm" },
  });
  expect(readFileSync).not.toHaveBeenCalled();
});

test("allows a private npm target without a package name", () => {
  const fs = {
    existsSync: () => true,
    readFileSync: () => JSON.stringify({ private: true }),
  };
  expect(
    readNpmPublicationTarget(fs, { private: true, eliware: { apply: ["npm-published"] } }),
  ).toEqual({
    applicable: true,
    packageName: null,
    workflow: { workflowPath: ".github/workflows/npm.yaml", profile: "npm" },
  });
});
