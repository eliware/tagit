import { validateReleaseRunIdentity } from "../../../../../src/commands/release-wait/validate-release/run/identity.mjs";

const candidate = { databaseId: 1 };
const validDetails = {
  databaseId: 1,
  status: "completed",
  conclusion: "success",
  headSha: "abc",
  jobs: [],
};

test("accepts valid details and an omitted run id", () => {
  expect(validateReleaseRunIdentity(validDetails, candidate, "abc")).toBe(validDetails);
  const withoutId = { ...validDetails };
  delete withoutId.databaseId;
  expect(validateReleaseRunIdentity(withoutId, candidate, "abc")).toBe(withoutId);
});

test("rejects malformed details fields", () => {
  for (const details of [
    null,
    { ...validDetails, databaseId: "1" },
    { ...validDetails, status: null },
    { ...validDetails, conclusion: 1 },
    { ...validDetails, headSha: 1 },
    { ...validDetails, jobs: null },
  ])
    expect(() => validateReleaseRunIdentity(details, candidate, "abc")).toThrow("malformed");
});

test("rejects a different run id or commit", () => {
  expect(() =>
    validateReleaseRunIdentity({ ...validDetails, databaseId: 2 }, candidate, "abc"),
  ).toThrow("expected 1");
  expect(() =>
    validateReleaseRunIdentity({ ...validDetails, headSha: "def" }, candidate, "abc"),
  ).toThrow("expected abc");
});
