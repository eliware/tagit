import validateReleaseRunDetailsShape from "../../../../../src/commands/release-wait/validate-release/run/details-shape.mjs";

const validDetails = {
  databaseId: 1,
  status: "completed",
  conclusion: "success",
  headSha: "abc",
  jobs: [],
};

test("accepts completed details", () => {
  expect(validateReleaseRunDetailsShape(validDetails, 1)).toBe(validDetails);
});

test("rejects malformed run detail fields", () => {
  for (const details of [
    null,
    { ...validDetails, databaseId: "1" },
    { ...validDetails, headSha: 1 },
    { ...validDetails, jobs: null },
  ])
    expect(() => validateReleaseRunDetailsShape(details, 1)).toThrow(
      "Release CI returned malformed details for run 1.",
    );
});
