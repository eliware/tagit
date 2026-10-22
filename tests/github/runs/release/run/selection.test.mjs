import { selectReleaseRun } from "../../../../../src/github/runs/release/run/selection.mjs";

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
test("selects the main CI run for the tagged commit", () => {
  expect(
    selectReleaseRun([{ databaseId: 4, headSha: "abc", headBranch: "main" }], "abc", "v1.0.0")
      .databaseId,
  ).toBe(4);
});
test("does not select a main branch run for a publication workflow", () => {
  expect(
    selectReleaseRun(
      [{ databaseId: 4, headSha: "abc", headBranch: "main" }],
      "abc",
      "v1.0.0",
      ".github/workflows/npm.yaml",
    ),
  ).toBeUndefined();
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
