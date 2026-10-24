import { jest } from "@jest/globals";
const verifyReleaseCi = jest.fn();
const reportReleaseCiLinks = jest.fn();

jest.unstable_mockModule(
  "../../../../../../src/commands/release-wait/verify/release/ci.mjs",
  () => ({ verifyReleaseCi }),
);
jest.unstable_mockModule(
  "../../../../../../src/commands/release-wait/verify/release/ci/links.mjs",
  () => ({ reportReleaseCiLinks }),
);

const { checkReleaseCi } =
  await import("../../../../../../src/commands/release-wait/verify/release/ci/check.mjs");

beforeEach(() => {
  jest.clearAllMocks();
});

test("polls and verifies the release CI workflow", async () => {
  const run = { databaseId: 1, url: "https://github.com/eliware/demo/actions/runs/1", jobs: [] };
  const windowsJobs = [{ name: "windows", status: "completed", conclusion: "success" }];
  const runnerLabelsByJobName = { validate: ["ubuntu"] };
  const poll = jest.fn(async () => run);
  verifyReleaseCi.mockReturnValue(windowsJobs);
  const log = { info: jest.fn() };
  await expect(
    checkReleaseCi({
      poll,
      common: { repo: "eliware/demo", tag: "v1.0.0" },
      log,
      repo: "eliware/demo",
      tag: "v1.0.0",
      runnerLabelsByJobName,
    }),
  ).resolves.toBeUndefined();
  expect(poll).toHaveBeenCalledWith({
    repo: "eliware/demo",
    tag: "v1.0.0",
    workflowPath: ".github/workflows/ci.yaml",
    workflowLabel: "CI",
  });
  expect(verifyReleaseCi).toHaveBeenCalledWith(run, runnerLabelsByJobName);
  expect(reportReleaseCiLinks).toHaveBeenCalledWith(
    log,
    "eliware/demo",
    "v1.0.0",
    run,
    windowsJobs,
  );
});
