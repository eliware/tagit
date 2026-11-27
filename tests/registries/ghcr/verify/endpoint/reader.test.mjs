import { jest } from "@jest/globals";
import readGhcrVersionsOutput from "../../../../../src/registries/ghcr/verify/endpoint/reader.mjs";

test("retries the request with the selected personal account path", async () => {
  const execFile = jest.fn((_command, _args, _options, callback) => {
    if (execFile.mock.calls.length === 1) {
      callback(Object.assign(new Error("HTTP 404"), { stderr: "" }), "", "");
      return;
    }
    callback(null, "versions", "");
  });
  await expect(readGhcrVersionsOutput(execFile, "eliware", "tagit")).resolves.toBe("versions");
  expect(execFile).toHaveBeenCalledTimes(2);
});
