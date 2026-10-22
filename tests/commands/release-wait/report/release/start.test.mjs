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

test("reports CI and publication runs when publication applies", async () => {
  const poll = jest
    .fn()
    .mockResolvedValueOnce({ databaseId: 1, url: "ci-url", jobs: [] })
    .mockResolvedValueOnce({ databaseId: 2, url: "publish-url", jobs: [] });
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
      checkPublish: true,
      publicationWorkflows: [{ workflowPath: ".github/workflows/npm.yaml", profile: "npm" }],
      poll,
    }),
  ).resolves.toEqual({ ciRunId: 1, publishRunId: 2 });
  expect(poll.mock.calls[1][0]).toEqual(
    expect.objectContaining({ workflowPath: ".github/workflows/npm.yaml", linksOnly: true }),
  );
  expect(log.info).toHaveBeenCalledWith("npm: [publish-url](publish-url)");
});

test("uses the default CI poller when no poll override is supplied", async () => {
  const execFile = jest.fn((_command, args, _options, callback) => {
    if (args[1] === "list")
      return callback(
        null,
        JSON.stringify([{ databaseId: 3, headSha: "abc", headBranch: "v1.0.0" }]),
        "",
      );
    return callback(
      null,
      JSON.stringify({
        databaseId: 3,
        status: "completed",
        conclusion: "success",
        headSha: "abc",
        jobs: [],
        url: "ci-url",
      }),
      "",
    );
  });
  const log = { info: jest.fn() };
  await expect(
    reportReleaseStart({
      execFile,
      repo: "eliware/demo",
      headSha: "abc",
      tag: "v1.0.0",
      pollMs: 0,
      maxPolls: 1,
      sleep: jest.fn(),
      log,
      checkPublish: false,
    }),
  ).resolves.toEqual({ ciRunId: 3, publishRunId: null });
  expect(log.info).toHaveBeenCalledWith("CI: [ci-url](ci-url)");
});
