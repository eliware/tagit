import { jest } from "@jest/globals";
import { reportReleaseStart } from "../../../../../src/commands/release-wait/report/release/start.mjs";

test("reports the CI run after it starts", async () => {
  const poll = jest.fn(async () => ({ databaseId: 1, url: "ci-url", jobs: [] }));
  const log = { info: jest.fn() };
  await expect(
    reportReleaseStart({
      execFile: jest.fn(),
      repo: "eliware/demo",
      headSha: "abc",
      tag: "v1.0.0",
      pollMs: 1,
      maxPolls: 2,
      sleep: jest.fn(),
      log,
      checkPublish: false,
      poll,
    }),
  ).resolves.toEqual({ ciRunId: 1, publishRunId: null });
  expect(poll).toHaveBeenCalledWith(
    expect.objectContaining({ workflowPath: ".github/workflows/ci.yaml", linksOnly: true }),
  );
  expect(log.info).toHaveBeenCalledWith("CI: [ci-url](ci-url)");
});

test.each([
  ["npm", [{ workflowPath: ".github/workflows/npm.yaml", profile: "npm" }]],
  ["GHCR", [{ workflowPath: ".github/workflows/ghcr.yaml", profile: "ghcr" }]],
  ["no publication", []],
])("reports only the CI run during release start for %s", async (_target, workflows) => {
  const poll = jest.fn(async () => ({ databaseId: 1, url: "ci-url", jobs: [] }));
  const log = { info: jest.fn() };
  await expect(
    reportReleaseStart({
      execFile: jest.fn(),
      repo: "eliware/demo",
      headSha: "abc",
      tag: "v1.0.0",
      pollMs: 1,
      maxPolls: 2,
      sleep: jest.fn(),
      log,
      checkPublish: workflows.length > 0,
      publicationWorkflows: workflows,
      poll,
    }),
  ).resolves.toEqual({ ciRunId: 1, publishRunId: null });
  expect(poll).toHaveBeenCalledTimes(1);
  expect(poll).toHaveBeenCalledWith(
    expect.objectContaining({ workflowPath: ".github/workflows/ci.yaml", linksOnly: true }),
  );
  expect(log.info).toHaveBeenCalledWith("CI: [ci-url](ci-url)");
  expect(log.info).not.toHaveBeenCalledWith(expect.stringMatching(/^(npm|ghcr):/));
});
