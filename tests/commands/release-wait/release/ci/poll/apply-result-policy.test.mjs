import { jest } from "@jest/globals";
import applyReleaseCiResultPolicy from "../../../../../../src/commands/release-wait/release/ci/poll/apply-result-policy.mjs";

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
      log: { info: jest.fn() },
      workflowLabel: "npm",
    });
    throw new Error("Expected the policy to reject the failed run.");
  } catch (error) {
    expect(error).toMatchObject({ code: "ERR_RELEASE_CI_FAILED" });
    expect(error.message).toContain("Release npm failed");
  }
});

test("reports a pending run and returns pending state", () => {
  const log = { info: jest.fn() };
  expect(
    applyReleaseCiResultPolicy(
      candidate,
      { ...baseDetails, status: "in_progress" },
      {
        log,
      },
    ),
  ).toEqual({ pending: true });
  expect(log.info).toHaveBeenCalledWith("Release CI is in_progress. Waiting.");
});
