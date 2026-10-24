import { verifyReleaseCi } from "../../../../../src/commands/release-wait/verify/release/ci.mjs";

test("validates CI job policy", () => {
  const result = verifyReleaseCi({
    jobs: [
      { name: "validate", labels: ["ubuntu-latest"], status: "completed", conclusion: "success" },
    ],
  });
  expect(result).toEqual([]);
});
