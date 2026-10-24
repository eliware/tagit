import { assertUnambiguousReleaseRunTimestamps } from "../../../../../src/github/runs/release/run/ambiguity-policy.mjs";

test.each([
  [[]],
  [[{ databaseId: 1 }]],
  [[{ createdAt: "2026-01-01" }, { createdAt: "2026-01-02" }]],
])("accepts consistent release run timestamp evidence: %j", (runs) =>
  expect(() => assertUnambiguousReleaseRunTimestamps(runs, "v1.0.0")).not.toThrow(),
);

test("rejects mixed release run timestamp evidence", () => {
  expect(() =>
    assertUnambiguousReleaseRunTimestamps(
      [{ databaseId: 1 }, { createdAt: "2026-01-02" }],
      "v1.0.0",
    ),
  ).toThrow("ambiguous");
});
