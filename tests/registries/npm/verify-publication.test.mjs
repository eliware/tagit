import { jest } from "@jest/globals";
import { verifyNpmPublication } from "../../../src/registries/npm/verify-publication.mjs";

test("waits for npm visibility and succeeds at the expected version", async () => {
  let attempts = 0;
  const info = jest.fn();
  const exec = jest.fn((_command, _args, _options, callback) =>
    callback(null, attempts++ === 0 ? '"2.0.0"' : '"2.1.0"', ""),
  );
  const sleep = jest.fn(async () => {});
  await expect(
    verifyNpmPublication(
      exec,
      { info },
      { packageName: "@eliware/demo", version: "2.1.0", retries: 2, retryMs: 10, sleep },
    ),
  ).resolves.toBeUndefined();
  expect(sleep).toHaveBeenCalledWith(10);
  expect(info).toHaveBeenNthCalledWith(1, "npm view @eliware/demo@2.1.0 (1/2): not found.");
  expect(info).toHaveBeenNthCalledWith(2, "npm view @eliware/demo@2.1.0 (2/2): available.");
});

test("reports bounded npm visibility failures", async () => {
  const exec = jest.fn((_command, _args, _options, callback) =>
    callback(new Error("registry unavailable"), "", ""),
  );
  const sleep = jest.fn(async () => {});
  await expect(
    verifyNpmPublication(
      exec,
      { debug: jest.fn() },
      { packageName: "demo", version: "1.0.0", retries: 2, retryMs: 10, sleep },
    ),
  ).rejects.toThrow("after 2 checks");
  expect(sleep).toHaveBeenCalledTimes(1);
});

test("logs a short npm error and the final visibility failure", async () => {
  const info = jest.fn();
  const exec = jest.fn((_command, _args, _options, callback) =>
    callback({ stderr: "npm error 404 Not Found" }, "", "npm error 404 Not Found"),
  );
  await expect(
    verifyNpmPublication(
      exec,
      { info },
      { packageName: "demo", version: "1.0.0", retries: 1, sleep: jest.fn() },
    ),
  ).rejects.toThrow("after 1 checks");
  expect(info).toHaveBeenNthCalledWith(1, "npm view demo@1.0.0 (1/1): failed (404 not found).");
  expect(info).toHaveBeenNthCalledWith(2, "npm did not expose demo@1.0.0 after 1 checks.");
});

test("reports an invisible version and the final visibility failure", async () => {
  const info = jest.fn();
  const exec = jest.fn((_command, _args, _options, callback) => callback(null, '"0.9.0"', ""));
  await expect(
    verifyNpmPublication(
      exec,
      { info },
      { packageName: "demo", version: "1.0.0", retries: 1, sleep: jest.fn() },
    ),
  ).rejects.toThrow("after 1 checks");
  expect(info).toHaveBeenNthCalledWith(1, "npm view demo@1.0.0 (1/1): not found.");
  expect(info).toHaveBeenNthCalledWith(2, "npm did not expose demo@1.0.0 after 1 checks.");
});
