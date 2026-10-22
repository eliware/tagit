import { jest } from "@jest/globals";
import { createCiVerificationFailure } from "../../../../src/validation/ci/verify/result-policy.mjs";

test("builds a failure when no exact-head run passes", () => {
  const failure = createCiVerificationFailure(
    jest.fn(),
    [],
    [{ databaseId: 4, status: "completed", conclusion: "failure", headSha: "abc" }],
    "abc",
  );
  expect(failure).toBeInstanceOf(Error);
  expect(failure.message).toContain("run 4 [completed/failure]");
});

test("builds a platform failure when passing runs lack Ubuntu", () => {
  const exec = jest.fn(() =>
    JSON.stringify({
      jobs: [{ name: "windows", status: "completed", conclusion: "success" }],
    }),
  );
  const failure = createCiVerificationFailure(
    exec,
    [{ databaseId: 4, status: "completed", conclusion: "success", headSha: "abc" }],
    [],
    "abc",
  );
  expect(failure.message).toContain("lacks a passing Ubuntu job");
  expect(failure.message).toContain("windows [completed/success]");
});
