import { jest } from "@jest/globals";
import { prepareReleaseContext } from "../../../src/commands/release-wait/prepare-release-context.mjs";

test("validates release inputs and prepares repository and runner context", () => {
  const execFileSync = jest.fn((_command, args) => {
    if (args[0] === "rev-parse") return "abc";
    if (args[0] === "remote") return "https://github.com/eliware/demo.git";
    if (args[0] === "show") return "jobs:\n  validate:\n    runs-on: ubuntu-latest";
    return "";
  });
  expect(
    prepareReleaseContext(execFileSync, {
      version: "1.2.3",
      release: { commitSha: "abc" },
      maxPolls: 2,
      npmRetries: 2,
      pollMs: 1,
      npmRetryMs: 1,
    }),
  ).toEqual({
    repo: "eliware/demo",
    tag: "v1.2.3",
    headSha: "abc",
    runnerLabelsByJobName: { validate: ["ubuntu"] },
  });
});

test("rejects invalid inputs before reading Git context", () => {
  const execFileSync = jest.fn();
  expect(() =>
    prepareReleaseContext(execFileSync, {
      version: "next",
      release: { commitSha: "abc" },
      maxPolls: 2,
      npmRetries: 2,
      pollMs: 1,
      npmRetryMs: 1,
    }),
  ).toThrow("must be valid");
  expect(execFileSync).not.toHaveBeenCalled();
});
