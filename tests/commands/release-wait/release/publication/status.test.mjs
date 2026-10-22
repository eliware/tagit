import { jest } from "@jest/globals";
import { verifyReleasePublication } from "../../../../../src/commands/release-wait/release/publication/status.mjs";

test("reports a public npm publication and skips GHCR when not declared", async () => {
  const fs = {
    existsSync: (file) => file === "package.json",
    readFileSync: () => JSON.stringify({ name: "demo", private: true }),
  };
  const run = {
    jobs: [
      {
        name: "validate",
        labels: ["ubuntu-latest"],
        status: "completed",
        conclusion: "success",
        url: "u",
      },
    ],
  };
  await expect(
    verifyReleasePublication({
      fs,
      execFile: jest.fn(),
      log: { info: jest.fn() },
      repo: "eliware/demo",
      tag: "v1.0.0",
      headSha: "abc",
      version: "1.0.0",
      run,
      release: {},
      maxPolls: 1,
      npmRetries: 1,
      pollMs: 0,
      npmRetryMs: 0,
      sleep: jest.fn(),
    }),
  ).resolves.toMatchObject({ ci: true, npm: false, ghcr: false });
});

const publicationInput = {
  runnerLabelsByJobName: { publish: ["ubuntu"], windows: ["windows"] },
  execFile: jest.fn((_command, args, _options, callback) =>
    callback(
      null,
      JSON.stringify([[{ name: null, metadata: { container: { tags: ["v1.0.0"] } } }]]),
      "",
    ),
  ),
  log: { info: jest.fn() },
  repo: "eliware/demo",
  tag: "v1.0.0",
  headSha: "abc",
  version: "1.0.0",
  run: { jobs: [] },
  verifiedTarget: { applicable: false, packageName: null, isPrivate: false },
  release: {},
  maxPolls: 1,
  npmRetries: 1,
  pollMs: 0,
  npmRetryMs: 0,
  sleep: jest.fn(),
};

test("requires the publish run for an applicable npm profile", async () => {
  await expect(
    verifyReleasePublication({
      ...publicationInput,
      fs: {
        existsSync: (file) => file === "package.json" || file === ".github/workflows/npm.yaml",
        readFileSync: () => JSON.stringify({ eliware: { apply: ["npm-published"] } }),
      },
      verifiedTarget: { applicable: true, packageName: "demo", isPrivate: false },
      publicationRuns: [],
    }),
  ).rejects.toThrow("npm workflow did not complete");
});

test("rejects malformed publish jobs", async () => {
  await expect(
    verifyReleasePublication({
      ...publicationInput,
      fs: {
        existsSync: (file) => file === "package.json" || file === ".github/workflows/ghcr.yaml",
        readFileSync: () => JSON.stringify({ eliware: { apply: ["ghcr-published"] } }),
      },
      publicationRuns: [{ profile: "ghcr", run: { jobs: null } }],
    }),
  ).rejects.toThrow("malformed job records");
});

test("checks GHCR after a successful publish", async () => {
  const fs = {
    existsSync: (file) => file === "package.json" || file === ".github/workflows/ghcr.yaml",
    readFileSync: () => JSON.stringify({ eliware: { apply: ["ghcr-published"] } }),
  };
  const log = { info: jest.fn(), debug: jest.fn() };
  await expect(
    verifyReleasePublication({
      ...publicationInput,
      fs,
      log,
      publicationRuns: [
        {
          profile: "ghcr",
          run: {
            jobs: [
              { name: "publish", status: "completed", conclusion: "success", url: "publish-url" },
              { name: "publish", status: "completed", conclusion: "success" },
              {
                name: "windows",
                status: "completed",
                conclusion: "success",
                labels: ["windows-latest"],
                url: "windows-url",
              },
              {
                name: "windows",
                status: "completed",
                conclusion: "success",
                labels: ["windows-latest"],
              },
            ],
          },
        },
      ],
    }),
  ).resolves.toMatchObject({ ci: true, npm: false, ghcr: true });
});
