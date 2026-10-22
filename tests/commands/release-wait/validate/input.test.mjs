import { validateReleaseInput } from "../../../../src/commands/release-wait/validate/input.mjs";
import { verifyRelease } from "../../../../src/commands/release-wait/verify/release.mjs";
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

test("rejects a missing commit when the version is valid", () =>
  expect(() => validateReleaseInput("1.2.3", {}, 30, 30, 10000, 10000)).toThrow(
    "version and commit SHA",
  ));

test("rejects a missing version when the commit is valid", () =>
  expect(() => validateReleaseInput(undefined, { commitSha: "abc" }, 30, 30, 10000, 10000)).toThrow(
    "version and commit SHA",
  ));
