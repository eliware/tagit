import { jest } from "@jest/globals";
import { pollNpmPublication } from "../../../src/registries/npm/poll-publication.mjs";

test("polls npm visibility until the requested version appears", async () => {
  const exec = jest.fn((_command, _args, _options, callback) => callback(null, '"1.2.0"', ""));
  const log = { info: jest.fn() };
  await expect(
    pollNpmPublication(exec, log, {
      packageName: "demo",
      version: "1.2.0",
      command: { executable: "npm", args: [], options: {} },
      retries: 1,
      retryMs: 0,
      sleep: jest.fn(),
    }),
  ).resolves.toBeUndefined();
  expect(log.info).toHaveBeenCalledWith("npm view demo@1.2.0 (1/1): available.");
});
