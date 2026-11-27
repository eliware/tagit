import { jest } from "@jest/globals";

const verifyGhcrPublication = jest.fn();
jest.unstable_mockModule(
  "../../../../../src/commands/release-wait/verify/registries/ghcr-check.mjs",
  () => ({ default: verifyGhcrPublication }),
);
const { default: verifyRegistryGhcrCheck } =
  await import("../../../../../src/commands/release-wait/verify/registry/ghcr-check.mjs");

test("forwards registry publication failures", async () => {
  verifyGhcrPublication.mockRejectedValue(new Error("registry unavailable"));
  await expect(
    verifyRegistryGhcrCheck({
      fs: {},
      execFile: jest.fn(),
      log: { info: jest.fn() },
      repo: "eliware/demo",
      version: "1.0.0",
      release: {},
      ghcr: true,
      maxPolls: 1,
      pollMs: 0,
      sleep: jest.fn(),
    }),
  ).rejects.toThrow("registry unavailable");
});
