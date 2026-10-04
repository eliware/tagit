import { jest } from "@jest/globals";
import { runCliBoundary } from "../../../src/cli/application/run-cli-boundary.mjs";

test("dispatches help through the CLI boundary", async () => {
  const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  try {
    await expect(
      runCliBoundary({ log: { error: jest.fn() }, exit: jest.fn() }, ["--help"]),
    ).resolves.toBeUndefined();
  } finally {
    consoleSpy.mockRestore();
  }
});

test("reports command failures through the exit boundary", async () => {
  const exit = jest.fn();
  await expect(
    runCliBoundary({ log: { error: jest.fn() }, exit }, ["unknown-command"]),
  ).rejects.toThrow();
  expect(exit).toHaveBeenCalledWith(1);
});
