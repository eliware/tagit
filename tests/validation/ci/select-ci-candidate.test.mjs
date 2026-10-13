import { selectCiCandidate } from "../../../src/validation/ci/select-ci-candidate.mjs";

test("selects successful and pending runs for the requested head", () => {
  const successful = { databaseId: 1, status: "completed", conclusion: "success", headSha: "abc" };
  expect(selectCiCandidate([successful], "abc")).toEqual({
    candidates: [successful],
    pending: null,
  });
  const pending = { databaseId: 2, status: "in_progress", conclusion: "", headSha: "abc" };
  expect(selectCiCandidate([pending], "abc")).toEqual({ candidates: [], pending });
});

test("rejects a run belonging to another head", () => {
  expect(
    selectCiCandidate([{ status: "completed", conclusion: "success", headSha: "old" }], "abc"),
  ).toEqual({
    candidates: [],
    pending: null,
  });
});

test("keeps successful exact-head evidence when a newer run failed", () => {
  const successful = { databaseId: 2, status: "completed", conclusion: "success", headSha: "abc" };
  const failed = { databaseId: 3, status: "completed", conclusion: "failure", headSha: "abc" };
  expect(selectCiCandidate([failed, successful], "abc")).toEqual({
    candidates: [successful],
    pending: null,
  });
});

test("keeps pending runs available when completed candidates lack runner evidence", () => {
  const successful = { databaseId: 1, status: "completed", conclusion: "success", headSha: "abc" };
  const pending = { databaseId: 2, status: "in_progress", conclusion: "", headSha: "abc" };
  expect(selectCiCandidate([successful, pending], "abc")).toEqual({
    candidates: [successful],
    pending,
  });
});
