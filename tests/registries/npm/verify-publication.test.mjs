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
  expect(info).toHaveBeenCalledTimes(2);
  expect(info).toHaveBeenNthCalledWith(1, "npm view @eliware/demo@2.1.0 (1/2): not visible.");
  expect(info).toHaveBeenNthCalledWith(2, "npm view @eliware/demo@2.1.0 (2/2): visible.");
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
  ).rejects.toThrow("after 2 attempts");
  expect(sleep).toHaveBeenCalledTimes(1);
});
test("logs short npm errors instead of command diagnostics", async () => {
  for (const error of [
    { stderr: "npm error code E404\nnpm error 404 Not Found" },
    { stdout: "npm ERR! 404 Not Found" },
    { message: "registry unavailable", code: "EAI_AGAIN" },
    {},
  ]) {
    const exec = jest.fn((_command, _args, _options, callback) =>
      callback(error, error.stdout, error.stderr),
    );
    const info = jest.fn();
    await expect(
      verifyNpmPublication(
        exec,
        { info },
        { packageName: "demo", version: "1.0.0", retries: 1, sleep: jest.fn() },
      ),
    ).rejects.toThrow("after 1 attempts");
    const detail = /404|E404|Not Found/i.test(error.stderr ?? error.stdout ?? error.message ?? "")
      ? "404 not found"
      : (error.code ?? "request failed");
    expect(info).toHaveBeenCalledTimes(2);
    expect(info).toHaveBeenNthCalledWith(1, `npm view demo@1.0.0 (1/1): failed (${detail}).`);
    expect(info).toHaveBeenNthCalledWith(2, "npm did not expose demo@1.0.0 after 1 attempts.");
  }
});
test("accepts npm view array output", async () => {
  const exec = jest.fn((_command, _args, _options, callback) => callback(null, '["1.0.0"]', ""));
  await expect(
    verifyNpmPublication(
      exec,
      { debug: jest.fn() },
      { packageName: "demo", version: "1.0.0", retries: 1, sleep: jest.fn() },
    ),
  ).resolves.toBeUndefined();
});

test("rejects npm view arrays with extra versions", async () => {
  const info = jest.fn();
  const exec = jest.fn((_command, _args, _options, callback) =>
    callback(null, '["1.0.0","1.0.1"]', ""),
  );
  await expect(
    verifyNpmPublication(
      exec,
      { info },
      { packageName: "demo", version: "1.0.0", retries: 1, sleep: jest.fn() },
    ),
  ).rejects.toThrow("after 1 attempts");
  expect(info).toHaveBeenCalledWith("npm view demo@1.0.0 (1/1): not visible.");
});

test("logs invisible registry output and the final visibility failure", async () => {
  const info = jest.fn();
  const exec = jest.fn((_command, _args, _options, callback) => callback(null, '"0.9.0"', ""));
  await expect(
    verifyNpmPublication(
      exec,
      { info },
      {
        packageName: "demo",
        version: "1.0.0",
        retries: 1,
        sleep: jest.fn(),
      },
    ),
  ).rejects.toThrow("after 1 attempts");
  expect(info).toHaveBeenNthCalledWith(1, "npm view demo@1.0.0 (1/1): not visible.");
  expect(info).toHaveBeenCalledWith("npm did not expose demo@1.0.0 after 1 attempts.");
});

test("handles an empty JSON response separately from an invalid response", async () => {
  const info = jest.fn();
  const exec = jest.fn((_command, _args, _options, callback) => callback(null, '""', ""));
  await expect(
    verifyNpmPublication(
      exec,
      { info },
      {
        packageName: "demo",
        version: "1.0.0",
        retries: 1,
        sleep: jest.fn(),
      },
    ),
  ).rejects.toThrow("after 1 attempts");
  expect(info).toHaveBeenCalledWith("npm view demo@1.0.0 (1/1): not visible.");
});
