import { jest } from "@jest/globals";
import { checkReleaseCi } from "../../../../../../src/commands/release-wait/verify/release/ci/check.mjs";

test("polls and verifies the release CI workflow", async () => {
  const poll = jest.fn(async () => ({
    url: "https://github.com/eliware/demo/actions/runs/1",
    jobs: [
      {
        name: "validate",
        labels: ["ubuntu-latest"],
        status: "completed",
        conclusion: "success",
        url: "https://github.com/eliware/demo/actions/runs/1/jobs/2",
      },
    ],
  }));
  const log = { info: jest.fn() };
  await expect(
    checkReleaseCi({
      poll,
      common: { repo: "eliware/demo", tag: "v1.0.0" },
      log,
      repo: "eliware/demo",
      tag: "v1.0.0",
    }),
  ).resolves.toBeUndefined();
  expect(poll).toHaveBeenCalledWith({
    repo: "eliware/demo",
    tag: "v1.0.0",
    workflowPath: ".github/workflows/ci.yaml",
    workflowLabel: "CI",
  });
  expect(log.info.mock.calls.map(([message]) => message)).toEqual([
    "Release CI verified for eliware/demo@v1.0.0:",
    "Workflow: [https://github.com/eliware/demo/actions/runs/1](https://github.com/eliware/demo/actions/runs/1)",
    "Ubuntu: [https://github.com/eliware/demo/actions/runs/1/jobs/2](https://github.com/eliware/demo/actions/runs/1/jobs/2)",
  ]);
});
