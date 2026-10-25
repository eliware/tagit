import { validateReleaseRunIdentity } from "../../../../../src/commands/release-wait/validate-release/run/identity.mjs";

const candidate = { databaseId: 1, headBranch: "v1.0.0" };
const validDetails = {
  databaseId: 1,
  status: "completed",
  conclusion: "success",
  headSha: "abc",
  jobs: [],
};

test("accepts valid details and an omitted run id", () => {
  expect(validateReleaseRunIdentity(validDetails, candidate, "abc", "v1.0.0")).toBe(validDetails);
  const withoutId = { ...validDetails };
  delete withoutId.databaseId;
  expect(validateReleaseRunIdentity(withoutId, candidate, "abc", "v1.0.0")).toBe(withoutId);
});

test("rejects a different run id or commit", () => {
  expect(() =>
    validateReleaseRunIdentity({ ...validDetails, databaseId: 2 }, candidate, "abc", "v1.0.0"),
  ).toThrow("expected 1");
  expect(() =>
    validateReleaseRunIdentity({ ...validDetails, headSha: "def" }, candidate, "abc", "v1.0.0"),
  ).toThrow("expected abc");
});

test("rejects a run candidate from main instead of the release tag", () => {
  expect(() =>
    validateReleaseRunIdentity(
      validDetails,
      { ...candidate, headBranch: "main" },
      "abc",
      "v1.0.0",
      ".github/workflows/npm.yaml",
    ),
  ).toThrow("not valid for release tag v1.0.0");
});

test("accepts the main branch for CI on the tagged commit", () => {
  expect(
    validateReleaseRunIdentity(
      validDetails,
      { ...candidate, headBranch: "main" },
      "abc",
      "v1.0.0",
      ".github/workflows/ci.yaml",
    ),
  ).toBe(validDetails);
});
