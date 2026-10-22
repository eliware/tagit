import { jest } from "@jest/globals";
import { readReleaseCiJson } from "../../../../../src/commands/release-wait/read/release-ci/json.mjs";

test("reads and parses GitHub release CI JSON", async () => {
  const execFile = jest.fn((_command, _args, _options, callback) =>
    callback(null, JSON.stringify({ databaseId: 7 }), ""),
  );
  await expect(readReleaseCiJson(execFile, ["run", "list"])).resolves.toEqual({ databaseId: 7 });
  expect(execFile).toHaveBeenCalledWith(
    "gh",
    ["run", "list"],
    { encoding: "utf8", timeout: 10000 },
    expect.any(Function),
  );
});

test("rejects invalid GitHub release CI JSON", async () => {
  const execFile = jest.fn((_command, _args, _options, callback) => callback(null, "{bad", ""));
  await expect(readReleaseCiJson(execFile, ["run", "view"])).rejects.toThrow();
});
