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
  publication: {
    applicable: false,
    ghcrApplicable: false,
    packageName: null,
    isPrivate: null,
    workflows: [],
  },
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
      publication: {
        applicable: true,
        ghcrApplicable: false,
        packageName: "demo",
        isPrivate: false,
        workflows: [{ workflowPath: ".github/workflows/npm.yaml", profile: "npm" }],
      },
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

test("reports successful publish links while it verifies npm visibility", async () => {
  const log = { info: jest.fn() };
  const execFile = jest.fn((_command, _args, _options, callback) => callback(null, '"1.0.0"', ""));
  await expect(
    verifyReleasePublication({
      ...base,
      fs: { existsSync: (file) => file === ".github/workflows/npm.yaml" },
      execFile,
      log,
      publication: {
        applicable: true,
        ghcrApplicable: false,
        packageName: "demo",
        isPrivate: false,
        workflows: [{ workflowPath: ".github/workflows/npm.yaml", profile: "npm" }],
      },
      publicationRuns: [
        {
          profile: "npm",
          run: {
            jobs: [
              { name: "publish", status: "completed", conclusion: "success", url: "publish-url" },
            ],
          },
        },
      ],
    }),
  ).resolves.toMatchObject({ ci: true, npm: true, ghcr: false });
  expect(log.info).toHaveBeenCalledWith("npm: [publish-url](publish-url)");
  expect(log.info).toHaveBeenCalledWith("npm verified: demo@1.0.0.");
});
