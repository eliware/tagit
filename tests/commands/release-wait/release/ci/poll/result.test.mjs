import { jest } from "@jest/globals";
import { applyReleaseCiResultPolicy } from "../../../../../../src/commands/release-wait/release/ci/poll/result.mjs";

const candidate = { databaseId: 7, headBranch: "v1.2.3" };
const baseDetails = {
  databaseId: 7,
  headSha: "abc",
  status: "completed",
  conclusion: "success",
  jobs: [],
};

test("returns merged details for a completed run", () => {
  expect(
    applyReleaseCiResultPolicy(candidate, baseDetails, {
      linksOnly: false,
      log: { info: jest.fn() },
    }),
  ).toMatchObject({ databaseId: 7, headSha: "abc", headBranch: "v1.2.3" });
});

test("throws a named release error for a failed run", () => {
  const details = {
    ...baseDetails,
    conclusion: "failure",
    jobs: [{ name: "test", status: "completed", conclusion: "failure" }],
  };
  try {
    applyReleaseCiResultPolicy(candidate, details, {
      linksOnly: false,
      log: { info: jest.fn() },
      workflowLabel: "npm",
    });
    throw new Error("Expected the policy to reject the failed run.");
  } catch (error) {
    expect(error).toMatchObject({ code: "ERR_RELEASE_CI_FAILED" });
    expect(error.message).toContain("Release npm failed");
  }
});

test("reports links for a failed run in links-only mode", () => {
  const details = { ...baseDetails, conclusion: "failure", url: "run-url" };
  expect(
    applyReleaseCiResultPolicy(candidate, details, {
      linksOnly: true,
      log: { info: jest.fn() },
    }),
  ).toMatchObject({ databaseId: 7, url: "run-url", linksOnly: true });
});

test("does not check completed CI jobs in links-only mode", () => {
  expect(
    applyReleaseCiResultPolicy(
      candidate,
      {
        ...baseDetails,
        jobs: [{ name: "validate", status: "completed", conclusion: "failure" }],
      },
      {
        linksOnly: true,
        log: { info: jest.fn() },
        workflowPath: ".github/workflows/ci.yaml",
        runnerLabelsByJobName: { validate: ["ubuntu"] },
      },
    ),
  ).toMatchObject({ databaseId: 7, linksOnly: true });
});

test("reports a pending run and returns pending state", () => {
  const log = { info: jest.fn() };
  expect(
    applyReleaseCiResultPolicy(
      candidate,
      { ...baseDetails, status: "in_progress" },
      {
        linksOnly: false,
        log,
      },
    ),
  ).toEqual({ pending: true });
  expect(log.info).toHaveBeenCalledWith("Release CI is in_progress. Waiting.");
});
