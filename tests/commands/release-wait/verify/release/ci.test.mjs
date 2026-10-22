import { jest } from "@jest/globals";
import { verifyReleaseCi } from "../../../../../src/commands/release-wait/verify/release/ci.mjs";

test("validates CI job policy and reports links", () => {
  const log = { info: jest.fn() };
  const result = verifyReleaseCi(log, "eliware/tagit", "v1.0.0", {
    jobs: [
      { name: "validate", labels: ["ubuntu-latest"], status: "completed", conclusion: "success" },
    ],
  });
  expect(result).toBeUndefined();
});

test("classifies a successful validate job using the tag workflow runner", () => {
  const result = verifyReleaseCi(
    { info: jest.fn() },
    "eliware/tagit",
    "v1.0.0",
    {
      jobs: [
        { name: "validate", labels: ["ubuntu-latest"], status: "completed", conclusion: "success" },
      ],
    },
    { validate: ["ubuntu"] },
  );
  expect(result).toBeUndefined();
});

test("accepts a stale validate status when the successful workflow shows passing steps", () => {
  expect(() =>
    verifyReleaseCi({ info: jest.fn() }, "eliware/codescope", "v15.0.0", {
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
  expect(() => verifyReleaseCi({ info: jest.fn() }, "demo", "v1.0.0", {})).toThrow(
    "malformed job records",
  );
});
