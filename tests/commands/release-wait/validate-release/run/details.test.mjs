import { validateReleaseRunDetails } from "../../../../../src/commands/release-wait/validate-release/run/details.mjs";

test("coordinates release identity and job validation", () => {
  const details = {
    databaseId: 1,
    status: "completed",
    conclusion: "success",
    headSha: "abc",
    jobs: [{ name: "validate", status: "completed", conclusion: "success" }],
  };
  expect(validateReleaseRunDetails(details, { databaseId: 1 }, "abc")).toBe(details);
});
