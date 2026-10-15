import { jest } from "@jest/globals";
import { buildTestCheck } from "../../../src/validation/local/test-command.mjs";

const fs = {
  existsSync: jest.fn(() => true),
  lstatSync: jest.fn(() => ({ isSymbolicLink: () => false })),
  readFileSync: jest.fn((file) =>
    JSON.stringify(
      file === "node_modules/@eliware/test/package.json"
        ? { name: "@eliware/test", version: "3.5.0" }
        : {
            name: "demo",
            devDependencies: { "@eliware/test": "^3.0.0" },
            scripts: { test: "eliware-test" },
          },
    ),
  ),
};

test("builds the shared npm test command with coverage waivers", () => {
  expect(buildTestCheck(fs).check).toEqual(["test", ["npm", ["test"]]]);
  expect(buildTestCheck(fs, { ignore100x4: true }).check).toEqual([
    "test",
    ["npm", ["test", "--", "--ignore-100x4"]],
  ]);
  expect(buildTestCheck(fs, { ignoreMonolithLimits: true }).check).toEqual([
    "test",
    ["npm", ["test", "--", "--ignore-monolith-limits"]],
  ]);
  expect(buildTestCheck(fs, { ignore100x4: true, ignoreMonolithLimits: true }).check).toEqual([
    "test",
    ["npm", ["test", "--", "--ignore-100x4", "--ignore-monolith-limits"]],
  ]);
});

test("requires a package file and test script", () => {
  expect(buildTestCheck({ existsSync: () => false })).toEqual({ missing: true, check: null });
  expect(
    buildTestCheck({ existsSync: () => true, readFileSync: () => JSON.stringify({ scripts: {} }) }),
  ).toEqual({ missing: true, check: null });
});

test("blocks check construction when the configured command or harness is invalid", () => {
  const invalidCommand = {
    ...fs,
    readFileSync: (file) =>
      JSON.stringify(
        file === "node_modules/@eliware/test/package.json"
          ? { name: "@eliware/test", version: "3.5.0" }
          : {
              name: "demo",
              devDependencies: { "@eliware/test": "^3.0.0" },
              scripts: { test: "jest" },
            },
      ),
  };
  expect(buildTestCheck(invalidCommand)).toEqual({ missing: false, invalid: true, check: null });
});
