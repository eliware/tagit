import { jest } from "@jest/globals";
import { verifyReleaseCi } from "../../../../../src/commands/release-wait/verify/release/ci.mjs";

test("coordinates CI job policy and publication target discovery", () => {
  const log = { info: jest.fn() };
  const result = verifyReleaseCi(
    { existsSync: () => false, readFileSync: () => "{}" },
    log,
    "eliware/tagit",
    "v1.0.0",
    {
      jobs: [
        { name: "validate", labels: ["ubuntu-latest"], status: "completed", conclusion: "success" },
      ],
    },
  );
  expect(result).toEqual(
    expect.objectContaining({ applicable: false, packageName: null, isPrivate: null }),
  );
});

test("classifies a successful validate job using the tag workflow runner", () => {
  const result = verifyReleaseCi(
    { existsSync: () => false, readFileSync: () => "{}" },
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
  expect(result).toEqual(
    expect.objectContaining({ applicable: false, packageName: null, isPrivate: null }),
  );
});

test("accepts a stale validate status when the successful workflow shows passing steps", () => {
  expect(() =>
    verifyReleaseCi(
      { existsSync: () => false, readFileSync: () => "{}" },
      { info: jest.fn() },
      "eliware/codescope",
      "v15.0.0",
      {
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
      },
    ),
  ).not.toThrow();
});
test("reports malformed job records", () => {
  expect(() => verifyReleaseCi({}, { info: jest.fn() }, "demo", "v1.0.0", {})).toThrow(
    "malformed job records",
  );
});
