import { buildCiVerificationFailure } from "../../../src/validation/ci/build-ci-verification-failure.mjs";

test("formats observed run details", () => {
  expect(
    buildCiVerificationFailure(
      [{ databaseId: 1, status: "completed", conclusion: "failure", headSha: "abc" }],
      "abc",
    ),
  ).toContain("run 1 [completed/failure]");
  expect(buildCiVerificationFailure([], "abc")).toBe(
    "No passing GitHub Actions run exists for abc.",
  );
});
