import { selectPendingRun } from "../../../../src/validation/ci/select/pending-run.mjs";

test("selects the newest pending run for the requested head", () => {
  const older = { databaseId: 2, status: "in_progress", headSha: "abc" };
  const newer = { databaseId: 3, status: "queued", headSha: "abc" };
  expect(selectPendingRun([older, newer], "abc")).toBe(newer);
});

test("ignores completed runs and runs for other heads", () => {
  expect(
    selectPendingRun(
      [
        { databaseId: 4, status: "in_progress", headSha: "other" },
        { databaseId: 3, status: "completed", headSha: "abc" },
      ],
      "abc",
    ),
  ).toBeNull();
});
