import { jest } from "@jest/globals";
import { verifyReleasePublication } from "../../../../../src/commands/release-wait/verify/release/publication.mjs";

const base = {
  fs: { existsSync: () => false },
  execFile: jest.fn(),
  log: { info: jest.fn() },
  repo: "eliware/demo",
  tag: "v1.0.0",
  headSha: "abc",
  version: "1.0.0",
  release: {},
  npmTarget: { applicable: false, packageName: null, isPrivate: null },
  publicationRuns: [],
  maxPolls: 1,
  npmRetries: 1,
  pollMs: 0,
  npmRetryMs: 0,
  sleep: jest.fn(),
};

test("rejects an applicable npm target without a passing publish job", async () => {
  const fs = {
    existsSync: (file) => file === ".github/workflows/npm.yaml",
  };
  const execFile = jest.fn();
  const log = { info: jest.fn() };
  await expect(
    verifyReleasePublication({
      ...base,
      fs,
      execFile,
      log,
      npmTarget: { applicable: true, packageName: "demo", isPrivate: false },
      publicationRuns: [
        {
          profile: "npm",
          run: { jobs: [{ name: "validate", status: "completed", conclusion: "success" }] },
        },
      ],
    }),
  ).rejects.toThrow("lacks a passing publish job");
  expect(execFile).not.toHaveBeenCalled();
});
