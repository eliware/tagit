import { jest } from "@jest/globals";
import { prepareReleaseTag } from "../../../src/git/release/prepare-release-tag.mjs";
test("prepares a tag from current HEAD", () => {
  const exec = jest.fn((command, args) => (args[0] === "rev-parse" ? "abc" : ""));
  expect(prepareReleaseTag(exec, { info: jest.fn() }, "v1.2.3").currentHead).toBe("abc");
});

test("rejects a release tag that points to another commit", () => {
  const exec = jest.fn((_command, args) => {
    if (args.join(" ") === "rev-parse HEAD") return "abc";
    if (args.join(" ") === "tag --list v1.2.3") return "v1.2.3";
    if (args.join(" ") === "rev-parse v1.2.3") return "def";
    return "";
  });
  expect(() => prepareReleaseTag(exec, { info: jest.fn() }, "v1.2.3")).toThrow(
    "already points to def",
  );
});
