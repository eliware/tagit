import { jest } from "@jest/globals";
import { verifyReleaseTagStability } from "../../../../src/commands/release-wait/resolve/tag-stability.mjs";

test("confirms that a tag object remains unchanged", () => {
  const execFileSync = jest.fn(() => "tag-object\n");
  expect(verifyReleaseTagStability(execFileSync, "v1.2.3", "tag-object")).toBe("tag-object");
  expect(execFileSync).toHaveBeenCalledWith("git", ["rev-parse", "refs/tags/v1.2.3"]);
});

test("rejects a tag object that changes during resolution", () => {
  expect(() =>
    verifyReleaseTagStability(
      jest.fn(() => "new-object"),
      "v1.2.3",
      "old-object",
    ),
  ).toThrow("Latest tag v1.2.3 changed while it was being resolved.");
});
