import { readCompletedRun } from "../../../../../src/validation/ci/read/completed/run.mjs";

const details = (overrides = {}) =>
  JSON.stringify({
    status: "completed",
    conclusion: "success",
    headSha: "abc",
    jobs: [{ name: "test", status: "completed", conclusion: "success" }],
    ...overrides,
  });

const read = (value, labels = {}) => readCompletedRun(() => value, 1, "abc", labels);

test("rejects malformed completion data", () => {
  for (const value of [
    "null",
    JSON.stringify({ conclusion: "success" }),
    JSON.stringify({ status: "completed" }),
  ])
    expect(() => read(value)).toThrow("invalid final data");
});

test("requires Ubuntu job evidence", () => {
  expect(() => read(details({ jobs: null }))).toThrow("malformed job records");
  expect(read(details())).toMatchObject({ passed: false });
  expect(readCompletedRun(() => details(), 1, "abc")).toMatchObject({ passed: false });
  expect(read(details(), { test: ["linux"] })).toMatchObject({ passed: false });
});

test("rejects a different head SHA", () => {
  expect(read(details({ headSha: "other" }), { test: ["ubuntu"] })).toMatchObject({
    passed: false,
    platforms: "Ubuntu passed",
  });
});

test("accepts successful Ubuntu and Windows jobs", () => {
  const result = read(
    details({
      jobs: [
        { name: "test", status: "completed", conclusion: "success" },
        { name: "test-windows", status: "completed", conclusion: "success" },
      ],
    }),
    { test: ["ubuntu"], "test-windows": ["windows"] },
  );
  expect(result).toMatchObject({ passed: true, platforms: "Ubuntu and Windows passed" });
});
