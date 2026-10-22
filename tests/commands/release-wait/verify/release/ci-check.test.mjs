import { jest } from "@jest/globals";
import { checkReleaseCi } from "../../../../../src/commands/release-wait/verify/release/ci-check.mjs";

test("polls and verifies the release CI workflow", async () => {
  const poll = jest.fn(async () => ({
    url: "ci-url",
    jobs: [
      { name: "validate", labels: ["ubuntu-latest"], status: "completed", conclusion: "success" },
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
});
