import selectExactHeadEvidence from "../../../../../../src/validation/ci/verify/exact/head/evidence.mjs";

test("selects matching successful candidates and the newest pending run", () => {
  const runs = [
    { databaseId: 4, headSha: "abc", status: "in_progress", conclusion: "" },
    { databaseId: 3, headSha: "abc", status: "completed", conclusion: "success" },
    { databaseId: 2, headSha: "abc", status: "completed", conclusion: "failure" },
    { databaseId: 9, headSha: "other", status: "completed", conclusion: "success" },
  ];
  expect(selectExactHeadEvidence(runs, "abc")).toEqual({
    candidates: [runs[1]],
    pending: runs[0],
  });
});

test("returns no candidates or pending run when no exact-head runs exist", () => {
  expect(selectExactHeadEvidence([], "abc")).toEqual({ candidates: [], pending: null });
});
