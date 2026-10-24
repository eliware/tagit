import { jest } from "@jest/globals";

const verifyReleasePublication = jest.fn();

jest.unstable_mockModule(
  "../../../../../src/commands/release-wait/verify/release/publication.mjs",
  () => ({ verifyReleasePublication }),
);

const { checkReleasePublication } =
  await import("../../../../../src/commands/release-wait/verify/release/publication-check.mjs");

test("forwards polled publication runs and target data to verification", async () => {
  const fs = {};
  const poll = jest.fn(async () => ({ databaseId: 8, jobs: [] }));
  const workflow = { workflowPath: ".github/workflows/npm.yaml", profile: "npm" };
  const publication = {
    applicable: true,
    ghcrApplicable: false,
    packageName: "demo",
    isPrivate: false,
    workflows: [workflow],
  };
  const result = { ci: true, npm: true, ghcr: false };
  verifyReleasePublication.mockResolvedValue(result);

  await expect(
    checkReleasePublication({
      fs,
      poll,
      common: { repo: "eliware/demo", tag: "v1.0.0" },
      publication,
      execFile: jest.fn(),
      log: { info: jest.fn() },
      repo: "eliware/demo",
      tag: "v1.0.0",
      headSha: "abc",
      version: "1.0.0",
      release: {},
      maxPolls: 1,
      npmRetries: 1,
      pollMs: 0,
      npmRetryMs: 0,
      sleep: jest.fn(),
    }),
  ).resolves.toBe(result);
  expect(verifyReleasePublication).toHaveBeenCalledWith(
    expect.objectContaining({
      publication,
      publicationRuns: [{ ...workflow, run: { databaseId: 8, jobs: [] } }],
    }),
  );
});
