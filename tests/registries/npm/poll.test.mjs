import { jest } from "@jest/globals";
import { pollNpmPublication } from "../../../src/registries/npm/poll.mjs";

test("retries npm visibility until the requested version appears", async () => {
  let attempts = 0;
  const exec = jest.fn((_command, _args, _options, callback) =>
    callback(null, attempts++ === 0 ? '"1.1.0"' : '"1.2.0"', ""),
  );
  const log = { info: jest.fn() };
  const sleep = jest.fn();
  await expect(
    pollNpmPublication(exec, log, {
      packageName: "demo",
      version: "1.2.0",
      command: { executable: "npm", args: [], options: {} },
      retries: 2,
      retryMs: 10,
      sleep,
    }),
  ).resolves.toBeUndefined();
  expect(sleep).toHaveBeenCalledWith(10);
  expect(exec).toHaveBeenCalledTimes(2);
});

test("reports retry exhaustion after the final npm visibility attempt", async () => {
  const exec = jest.fn((_command, _args, _options, callback) =>
    callback(new Error("registry unavailable"), "", ""),
  );
  const log = { info: jest.fn() };
  const sleep = jest.fn();
  await expect(
    pollNpmPublication(exec, log, {
      packageName: "demo",
      version: "1.2.0",
      command: { executable: "npm", args: [], options: {} },
      retries: 2,
      retryMs: 10,
      sleep,
    }),
  ).rejects.toThrow("npm did not expose demo@1.2.0 after 2 checks.");
  expect(sleep).toHaveBeenCalledTimes(1);
  expect(log.info).toHaveBeenLastCalledWith("npm did not expose demo@1.2.0 after 2 checks.");
});
