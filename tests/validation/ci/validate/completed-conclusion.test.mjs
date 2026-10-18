import { validateCompletedConclusion } from "../../../../src/validation/ci/validate/completed-conclusion.mjs";

test("accepts successful and pending conclusions", () => {
  expect(() =>
    validateCompletedConclusion({ status: "completed", databaseId: 1, conclusion: "success" }),
  ).not.toThrow();
  expect(() => validateCompletedConclusion({ status: "in_progress" })).not.toThrow();
});

test("rejects invalid final results and accepts known failed conclusions", () => {
  expect(() =>
    validateCompletedConclusion({ status: "completed", databaseId: 1, conclusion: "unknown" }),
  ).toThrow("invalid final result");
  expect(() =>
    validateCompletedConclusion({ status: "completed", databaseId: 1, conclusion: "failure" }),
  ).not.toThrow();
});
