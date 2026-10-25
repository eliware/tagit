import { jest } from "@jest/globals";
import { prepareReleaseTag } from "../../../src/git/release/prepare-release-tag.mjs";
test("adds a tag to the validated release commit", () => {
  const exec = jest.fn();
  const log = { info: jest.fn() };
  expect(
    prepareReleaseTag(exec, log, "v1.2.3", { currentHead: "abc", tagReused: false }).currentHead,
  ).toBe("abc");
  expect(exec).toHaveBeenCalledWith("git", ["tag", "v1.2.3", "abc"], { stdio: "inherit" });
  expect(log.info).toHaveBeenCalledWith("Add tag v1.2.3 to the current commit.");
});

test("does not add a tag that release preparation already reused", () => {
  const exec = jest.fn();
  const log = { info: jest.fn() };
  expect(
    prepareReleaseTag(exec, log, "v1.2.3", { currentHead: "abc", tagReused: true }).currentHead,
  ).toBe("abc");
  expect(exec).not.toHaveBeenCalled();
  expect(log.info).toHaveBeenCalledWith("Tag v1.2.3 points to the current commit. Use the tag.");
});
