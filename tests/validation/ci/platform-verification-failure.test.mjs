import { jest } from "@jest/globals";
import { buildPlatformVerificationFailure } from "../../../src/validation/ci/platform-verification-failure.mjs";

test("formats platform evidence failures through the job summarizer", () => {
  const exec = jest.fn(() =>
    JSON.stringify({ jobs: [{ name: "ubuntu", status: "completed", conclusion: "failure" }] }),
  );
  expect(buildPlatformVerificationFailure(exec, [{ databaseId: 1 }], "abc")).toContain(
    "lacks a passing Ubuntu job",
  );
});
