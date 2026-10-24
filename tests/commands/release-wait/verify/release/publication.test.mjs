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

test("verifies publication jobs and registries for an applicable npm target", async () => {
  const fs = {
    existsSync: (file) => file === ".github/workflows/npm.yaml",
  };
  const execFile = jest.fn((_command, args, _options, callback) => callback(null, '"1.0.0"', ""));
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
          run: {
            jobs: [
              {
                name: "publish",
                status: "completed",
                conclusion: "success",
              },
            ],
          },
        },
      ],
    }),
  ).resolves.toMatchObject({ ci: true, npm: true, ghcr: false });
  expect(log.info).toHaveBeenCalledWith("Release npm workflow verified for eliware/demo@v1.0.0.");
});
