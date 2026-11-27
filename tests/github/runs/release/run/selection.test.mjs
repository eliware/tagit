import selectReleaseRun from "../../../../../src/github/runs/release/run/selection.mjs";

test("selects the newest exact release tag and commit", () => {
  expect(
    selectReleaseRun(
      [
        { databaseId: 1, createdAt: "2026-01-01", headSha: "abc", headBranch: "v1.0.0" },
        { databaseId: 2, createdAt: "2026-01-02", headSha: "abc", headBranch: "refs/tags/v1.0.0" },
      ],
      "abc",
      "v1.0.0",
    ).databaseId,
  ).toBe(2);
});
test("selects a main branch CI run for the tagged commit", () => {
  expect(
    selectReleaseRun([{ databaseId: 4, headSha: "abc", headBranch: "main" }], "abc", "v1.0.0"),
  ).toMatchObject({ databaseId: 4 });
});
test("selects the newest valid run when main and tag runs exist for the commit", () => {
  expect(
    selectReleaseRun(
      [
        { databaseId: 4, createdAt: "2026-01-01", headSha: "abc", headBranch: "main" },
        { databaseId: 5, createdAt: "2026-01-02", headSha: "abc", headBranch: "v1.0.0" },
      ],
      "abc",
      "v1.0.0",
    ),
  ).toMatchObject({ databaseId: 5 });
});
test("rejects ambiguous incomplete release evidence", () => {
  expect(() =>
    selectReleaseRun(
      [
        { databaseId: 1, headSha: "abc", headBranch: "v1.0.0" },
        { databaseId: 2, createdAt: "2026-01-02", headSha: "abc", headBranch: "v1.0.0" },
      ],
      "abc",
      "v1.0.0",
    ),
  ).toThrow("ambiguous");
});
test("uses database id as a tie-breaker when creation times are absent", () => {
  expect(
    selectReleaseRun(
      [
        { databaseId: 1, headSha: "abc", headBranch: "v1.0.0" },
        { databaseId: 2, headSha: "abc", headBranch: "v1.0.0" },
      ],
      "abc",
      "v1.0.0",
    ).databaseId,
  ).toBe(2);
});
