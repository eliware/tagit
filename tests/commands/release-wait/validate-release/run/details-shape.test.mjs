import { validateReleaseRunDetailsShape } from "../../../../../src/commands/release-wait/validate-release/run/details-shape.mjs";

const validDetails = {
  databaseId: 1,
  status: "completed",
  conclusion: "success",
  headSha: "abc",
  jobs: [],
};

test("accepts completed details and pending details with optional conclusions", () => {
  expect(validateReleaseRunDetailsShape(validDetails, 1)).toBe(validDetails);
  expect(
    validateReleaseRunDetailsShape(
      { status: "in_progress", conclusion: null, headSha: "abc", jobs: [] },
      1,
    ),
  ).toMatchObject({ conclusion: null });
  expect(
    validateReleaseRunDetailsShape({ status: "in_progress", headSha: "abc", jobs: [] }, 1),
  ).toMatchObject({ status: "in_progress" });
});

test.each(["queued", "in_progress", "waiting", "requested", "pending"])(
  "accepts the known pending status %s",
  (status) => {
    expect(
      validateReleaseRunDetailsShape({ ...validDetails, status, conclusion: null }, 1),
    ).toEqual(expect.objectContaining({ status }));
  },
);

test("rejects malformed run detail fields", () => {
  for (const details of [
    null,
    { ...validDetails, databaseId: "1" },
    { ...validDetails, status: null },
    { ...validDetails, status: "unknown_terminal" },
    { ...validDetails, conclusion: 1 },
    { ...validDetails, conclusion: "unknown" },
    { ...validDetails, conclusion: null },
    { ...validDetails, conclusion: undefined },
    { ...validDetails, headSha: 1 },
    { ...validDetails, jobs: null },
  ])
    expect(() => validateReleaseRunDetailsShape(details, 1)).toThrow(
      "Release CI returned malformed details for run 1.",
    );
});
