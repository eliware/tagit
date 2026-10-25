import { jest } from "@jest/globals";
import { readNpmPublicationTarget } from "../../../../src/commands/release-wait/read/npm-target.mjs";

function fsFor(packageName, npmWorkflow = true) {
  return {
    existsSync: (file) =>
      file === "package.json" || (npmWorkflow && file === ".github/workflows/npm.yaml"),
    readFileSync: () => JSON.stringify({ name: packageName }),
  };
}

test("does not read npm metadata when the workflow or profile does not apply", () => {
  const fs = fsFor("demo", false);
  expect(
    readNpmPublicationTarget(fs, { private: false, eliware: { apply: ["npm-published"] } }),
  ).toEqual({ applicable: false, packageName: null, workflow: null });
  expect(readNpmPublicationTarget(fsFor("demo"), { eliware: { apply: ["general"] } })).toEqual({
    applicable: false,
    packageName: null,
    workflow: null,
  });
});

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
