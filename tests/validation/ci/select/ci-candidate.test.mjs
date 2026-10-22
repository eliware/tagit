import { selectCiCandidate } from "../../../../src/validation/ci/select/ci-candidate.mjs";

test("selects successful runs for the requested head", () => {
  const successful = { databaseId: 1, status: "completed", conclusion: "success", headSha: "abc" };
  expect(selectCiCandidate([successful], "abc")).toEqual([successful]);
});

test("rejects a run belonging to another head", () => {
  expect(
    selectCiCandidate([{ status: "completed", conclusion: "success", headSha: "old" }], "abc"),
  ).toEqual([]);
});

test("keeps successful exact-head evidence when a newer run failed", () => {
  const successful = { databaseId: 2, status: "completed", conclusion: "success", headSha: "abc" };
  const failed = { databaseId: 3, status: "completed", conclusion: "failure", headSha: "abc" };
  expect(selectCiCandidate([failed, successful], "abc")).toEqual([successful]);
});
