import { jest } from "@jest/globals";
import { mergeUpstream } from "../../../src/upstream/merge/upstream.mjs";

test("merges successfully", () => {
  const exec = jest.fn();
  expect(mergeUpstream(exec, "upstream/main", "sync", { log: jest.fn() })).toBe(true);
  expect(exec).toHaveBeenCalledWith("git", ["merge", "upstream/main", "-m", "sync"], {
    stdio: "inherit",
  });
});

test("reports conflicts and does not claim success", () => {
  const exec = jest.fn((command, args) => {
    if (args[0] === "merge") throw new Error("conflict");
    if (args[0] === "diff") return "conflicted.txt\n";
    return "";
  });
  const log = { log: jest.fn() };
  expect(mergeUpstream(exec, "upstream/main", "sync", log)).toBe(false);
  expect(log.log).toHaveBeenCalled();
});

test("rethrows merge failures when Git reports no conflict files", () => {
  const error = new Error("merge command failed before conflict resolution");
  const exec = jest.fn((_command, args) => {
    if (args[0] === "merge") throw error;
    return "";
  });
  expect(() => mergeUpstream(exec, "upstream/main", "sync", { log: jest.fn() })).toThrow(error);
});
