import { verifyReleaseCi } from "../../../../../src/commands/release-wait/verify/release/ci.mjs";

test("validates CI job policy", () => {
  const result = verifyReleaseCi({
    jobs: [
      { name: "validate", labels: ["ubuntu-latest"], status: "completed", conclusion: "success" },
    ],
  });
  expect(result).toEqual([]);
});

test("classifies a successful validate job using the tag workflow runner", () => {
  const result = verifyReleaseCi(
    {
      jobs: [
        { name: "validate", labels: ["ubuntu-latest"], status: "completed", conclusion: "success" },
      ],
    },
    { validate: ["ubuntu"] },
  );
  expect(result).toEqual([]);
});

test("accepts a stale validate status when the successful workflow shows passing steps", () => {
  expect(() =>
    verifyReleaseCi({
      status: "completed",
      conclusion: "success",
      jobs: [
        {
          name: "validate",
          labels: ["ubuntu-latest"],
          status: "in_progress",
          conclusion: null,
          steps: [{ name: "npm test", status: "completed", conclusion: "success" }],
        },
      ],
    }),
  ).not.toThrow();
});
test("reports malformed job records", () => {
  expect(() => verifyReleaseCi({})).toThrow("malformed job records");
});
