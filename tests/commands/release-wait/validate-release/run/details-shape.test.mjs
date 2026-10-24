import { validateReleaseRunDetailsShape } from "../../../../../src/commands/release-wait/validate-release/run/details-shape.mjs";

const validDetails = {
  databaseId: 1,
  status: "completed",
  conclusion: "success",
  headSha: "abc",
  jobs: [],
};

test("accepts complete run details with an optional run id and conclusion", () => {
  expect(validateReleaseRunDetailsShape(validDetails, 1)).toBe(validDetails);
  expect(
    validateReleaseRunDetailsShape(
      { status: "completed", conclusion: null, headSha: "abc", jobs: [] },
      1,
    ),
  ).toMatchObject({ conclusion: null });
  expect(
    validateReleaseRunDetailsShape({ status: "completed", headSha: "abc", jobs: [] }, 1),
  ).toMatchObject({ status: "completed" });
});

test("rejects malformed run detail fields", () => {
  for (const details of [
    null,
    { ...validDetails, databaseId: "1" },
    { ...validDetails, status: null },
    { ...validDetails, conclusion: 1 },
    { ...validDetails, headSha: 1 },
    { ...validDetails, jobs: null },
  ])
    expect(() => validateReleaseRunDetailsShape(details, 1)).toThrow(
      "Release CI returned malformed details for run 1.",
    );
});
