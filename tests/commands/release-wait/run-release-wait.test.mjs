import { jest } from "@jest/globals";
import { PassThrough } from "node:stream";
import { runReleaseWaitCommand } from "../../../src/commands/release-wait/run-release-wait.mjs";

test("verifies the latest release tag", async () => {
  const execFileSync = jest.fn((command, args) => (args[0] === "describe" ? "v1.2.3\n" : "abc\n"));
  const verifyRelease = jest.fn();
  await expect(
    runReleaseWaitCommand({
      execFileSync,
      fs: {},
      log: { info: jest.fn() },
      verifyRelease,
      execFile: jest.fn(),
    }),
  ).resolves.toEqual({ version: "1.2.3", commitSha: "abc" });
  expect(verifyRelease).toHaveBeenCalledWith(execFileSync, {}, expect.anything(), {
    version: "1.2.3",
    release: { commitSha: "abc" },
    execFile: expect.any(Function),
  });
});

test("writes a status line before release-wait finishes", async () => {
  const output = new PassThrough();
  let received = "";
  output.on("data", (chunk) => {
    received += chunk.toString();
  });
  let finishVerification;
  const verifyRelease = jest.fn(() => new Promise((resolve) => (finishVerification = resolve)));
  const command = runReleaseWaitCommand({
    execFileSync: jest.fn((command, args) => (args[0] === "describe" ? "v1.2.3\n" : "abc\n")),
    fs: {},
    log: { info: (message) => output.write(`${message}\n`) },
    verifyRelease,
    execFile: jest.fn(),
  });
  await Promise.resolve();
  expect(received).toContain("Starting release-wait checks.");
  finishVerification();
  await command;
  output.end();
});
