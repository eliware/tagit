import { jest } from "@jest/globals";
import { validateReleaseInput } from "../../../../src/commands/release-wait/validate/input.mjs";
import { prepareReleaseContext } from "../../../../src/commands/release-wait/prepare-release-context.mjs";
import { verifyRelease } from "../../../../src/commands/release-wait/verify/release.mjs";

test("accepts valid release input and polling settings", () =>
  expect(() =>
    validateReleaseInput("1.2.3", { commitSha: "abc" }, 30, 30, 10000, 10000),
  ).not.toThrow());

test("rejects a missing commit when the version is valid", () =>
  expect(() => validateReleaseInput("1.2.3", {}, 30, 30, 10000, 10000)).toThrow(
    "version and commit SHA",
  ));

test("rejects a missing version when the commit is valid", () =>
  expect(() => validateReleaseInput(undefined, { commitSha: "abc" }, 30, 30, 10000, 10000)).toThrow(
    "version and commit SHA",
  ));

test.each([
  ["invalid release input", { version: "next", release: { commitSha: "abc" } }],
  ["omitted release options", undefined],
])("rejects %s before external inspection", async (_description, options) => {
  const inspect = jest.fn();
  const fs = { existsSync: jest.fn(), readFileSync: jest.fn() };
  await expect(verifyRelease(inspect, fs, {}, options)).rejects.toThrow();
  expect(inspect).not.toHaveBeenCalled();
  expect(fs.existsSync).not.toHaveBeenCalled();
});

test("rejects invalid context before reading Git or package data", () => {
  const execFileSync = jest.fn();
  const fs = { existsSync: jest.fn(), readFileSync: jest.fn() };
  expect(() =>
    prepareReleaseContext(execFileSync, fs, {
      version: "next",
      release: { commitSha: "abc" },
      maxPolls: 2,
      npmRetries: 2,
      pollMs: 1,
      npmRetryMs: 1,
    }),
  ).toThrow("must be valid");
  expect(execFileSync).not.toHaveBeenCalled();
  expect(fs.existsSync).not.toHaveBeenCalled();
});
