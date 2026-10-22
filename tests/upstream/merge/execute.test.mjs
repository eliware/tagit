import { jest } from "@jest/globals";
import { executeUpstreamMerge } from "../../../src/upstream/merge/execute.mjs";

test("fetches, merges, and pushes the upstream branch", () => {
  const exec = jest.fn((_command, args) => (args[0] === "symbolic-ref" ? "upstream/main\n" : ""));
  expect(executeUpstreamMerge(exec, "release sync", { log: jest.fn() })).toBe(true);
  expect(exec.mock.calls.map(([, args]) => args[0])).toEqual([
    "fetch",
    "symbolic-ref",
    "merge",
    "push",
  ]);
  expect(exec).toHaveBeenCalledWith("git", ["merge", "upstream/main", "-m", "release sync"], {
    stdio: "inherit",
  });
});

test("reports merge conflicts and does not push", () => {
  const exec = jest.fn((_command, args) => {
    if (args[0] === "symbolic-ref") return "upstream/main\n";
    if (args[0] === "merge") throw new Error("conflict");
    return "";
  });
  const log = { log: jest.fn() };
  expect(executeUpstreamMerge(exec, "release sync", log)).toBe(false);
  expect(exec).toHaveBeenCalledWith("git", ["diff", "--name-only", "--diff-filter=U"], {
    stdio: "inherit",
  });
  expect(exec).not.toHaveBeenCalledWith("git", ["push"], expect.anything());
});
