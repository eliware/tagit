import { jest } from "@jest/globals";
import { verifyNpmPublication } from "../../../src/registries/npm/verify-publication.mjs";

test("waits for npm visibility and succeeds at the expected version", async () => {
  let attempts = 0;
  const exec = jest.fn((_command, _args, _options, callback) =>
    callback(null, attempts++ === 0 ? '"2.0.0"' : '"2.1.0"', ""),
  );
  const sleep = jest.fn(async () => {});
  await expect(
    verifyNpmPublication(
      exec,
      { debug: jest.fn() },
      { packageName: "@eliware/demo", version: "2.1.0", retries: 2, retryMs: 10, sleep },
    ),
  ).resolves.toBeUndefined();
  expect(sleep).toHaveBeenCalledWith(10);
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
test("includes bounded command diagnostics in retry logging", async () => {
  for (const error of [
    { stderr: "stderr detail" },
    { stdout: "stdout detail" },
    { message: "message detail" },
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
    expect(info).toHaveBeenCalledWith(
      expect.stringContaining(error.stderr ?? error.stdout ?? error.message ?? "unknown error"),
    );
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

test("logs each npm visibility attempt and enables Windows command shims", async () => {
  const info = jest.fn();
  const exec = jest.fn((_command, _args, _options, callback) => callback(null, '["8.0.0"]', ""));
  await verifyNpmPublication(
    exec,
    { info },
    {
      packageName: "@eliware/test",
      version: "8.0.0",
      retries: 2,
      sleep: jest.fn(),
    },
  );
  expect(info).toHaveBeenNthCalledWith(
    1,
    "Checking npm visibility for @eliware/test@8.0.0 (attempt 1/2)...",
  );
  expect(info).toHaveBeenNthCalledWith(
    2,
    "npm visibility attempt 1/2: published version is visible.",
  );
  expect(exec).toHaveBeenCalledWith(
    'npm.cmd "view" "@eliware/test@8.0.0" "version" "--json"',
    [],
    expect.objectContaining({ encoding: "utf8", shell: true }),
    expect.any(Function),
  );
});

test("rejects unsafe npm package names and versions before constructing a Windows command", async () => {
  const exec = jest.fn();
  await expect(
    verifyNpmPublication(
      exec,
      { info: jest.fn() },
      {
        packageName: "demo & whoami",
        version: "1.0.0",
        retries: 1,
        sleep: jest.fn(),
      },
    ),
  ).rejects.toThrow("Package name is invalid");
  await expect(
    verifyNpmPublication(
      exec,
      { info: jest.fn() },
      {
        packageName: "demo",
        version: "1.0.0 & whoami",
        retries: 1,
        sleep: jest.fn(),
      },
    ),
  ).rejects.toThrow("Version is invalid");
  expect(exec).not.toHaveBeenCalled();
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
  expect(info).toHaveBeenCalledWith(expect.stringContaining('registry returned "0.9.0"'));
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
  expect(info).toHaveBeenCalledWith(expect.stringContaining('registry returned ""'));
});

test("rejects missing npm publication arguments", async () => {
  await expect(verifyNpmPublication(jest.fn(), {}, { version: "1.0.0" })).rejects.toThrow(
    "Package name is invalid",
  );
  await expect(verifyNpmPublication(jest.fn(), {}, { packageName: "demo" })).rejects.toThrow(
    "Version is invalid",
  );
});

test("uses the POSIX npm executable and argument vector", async () => {
  const originalPlatform = process.platform;
  Object.defineProperty(process, "platform", { configurable: true, value: "linux" });
  try {
    const exec = jest.fn((_command, _args, _options, callback) => callback(null, '"1.0.0"', ""));
    await verifyNpmPublication(
      exec,
      { info: jest.fn() },
      { packageName: "demo", version: "1.0.0", retries: 1, sleep: jest.fn() },
    );
    expect(exec).toHaveBeenCalledWith(
      "npm",
      ["view", "demo@1.0.0", "version", "--json"],
      { encoding: "utf8" },
      expect.any(Function),
    );
  } finally {
    Object.defineProperty(process, "platform", { configurable: true, value: originalPlatform });
  }
});
