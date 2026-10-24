import { validateReleaseInput } from "../../../../src/commands/release-wait/validate/input.mjs";
import { verifyRelease } from "../../../../src/commands/release-wait/verify/release.mjs";
import { prepareReleaseContext } from "../../../../src/commands/release-wait/prepare-release-context.mjs";
import { jest } from "@jest/globals";

test("accepts valid release input and polling settings", () =>
  expect(() =>
    validateReleaseInput("1.2.3", { commitSha: "abc" }, 30, 30, 10000, 10000),
  ).not.toThrow());

test.each([
  ["invalid release input", { version: "next", release: { commitSha: "abc" } }],
  ["omitted release options", undefined],
])("rejects %s before external inspection", async (_description, options) => {
  const inspect = jest.fn();
  await expect(
    verifyRelease(inspect, { existsSync: jest.fn(), readFileSync: jest.fn() }, {}, options),
  ).rejects.toThrow();
  expect(inspect).not.toHaveBeenCalled();
});

test("rejects invalid release input before reading Git or package context", () => {
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

test("rejects a missing commit when the version is valid", () =>
  expect(() => validateReleaseInput("1.2.3", {}, 30, 30, 10000, 10000)).toThrow(
    "version and commit SHA",
  ));

test("rejects a missing version when the commit is valid", () =>
  expect(() => validateReleaseInput(undefined, { commitSha: "abc" }, 30, 30, 10000, 10000)).toThrow(
    "version and commit SHA",
  ));
